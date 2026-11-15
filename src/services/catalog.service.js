/**
 * IBTU E-Commerce Backend
 * src/services/catalog.service.js
 *
 * Public Catalog Business Logic & Optimized Database Queries
 *
 * Performance & Architecture:
 *  - Enforces active products and active variants only.
 *  - Single-query product listing with aggregated price range, stock status, and primary image.
 *  - Eliminates duplicate products caused by SQL joins.
 *  - Supports category hierarchy (parents include products from subcategories).
 *  - Prevents N+1 database queries.
 *  - Safe parameterized queries with strict sorting whitelists.
 */

const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

class CatalogService {
  /**
   * Helper: Format a single row from product listing queries
   */
  static formatProductCard(row) {
    let primaryImage = null;
    if (row.primary_image_json) {
      primaryImage =
        typeof row.primary_image_json === 'string'
          ? JSON.parse(row.primary_image_json)
          : row.primary_image_json;
    }

    const hasVariants = row.min_price !== null && row.min_price !== undefined;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      short_description: row.short_description || null,
      category: {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
      },
      price: hasVariants
        ? {
            min: parseFloat(row.min_price),
            max: parseFloat(row.max_price),
            currency: 'ETB',
          }
        : null,
      primary_image: primaryImage,
      is_featured: Boolean(row.is_featured),
      stock_status: row.has_stock > 0 ? 'in_stock' : 'out_of_stock',
      created_at: row.created_at,
    };
  }

  /**
   * Helper: Resolve a category slug or ID into an array of category IDs (including all descendant subcategories)
   */
  static async resolveCategoryIds(categoryIdentifier) {
    const [allCategories] = await pool.query(
      'SELECT id, parent_id, slug FROM categories WHERE is_active = 1'
    );

    // Find the target category
    const isNumeric = !isNaN(parseInt(categoryIdentifier, 10)) && /^\d+$/.test(String(categoryIdentifier).trim());
    const target = allCategories.find((c) =>
      isNumeric ? c.id === parseInt(categoryIdentifier, 10) : c.slug === categoryIdentifier.trim()
    );

    if (!target) return null;

    // Collect target ID and all its descendants
    const resultIds = [target.id];
    const findChildren = (parentId) => {
      for (const cat of allCategories) {
        if (cat.parent_id === parentId) {
          resultIds.push(cat.id);
          findChildren(cat.id);
        }
      }
    };
    findChildren(target.id);

    return { target, categoryIds: resultIds };
  }

  /**
   * List public products with search, filters, sorting, and pagination
   */
  static async getProducts(filters = {}) {
    const page = Math.max(1, parseInt(filters.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(filters.limit, 10) || 12));
    const offset = (page - 1) * limit;

    const whereConditions = ["p.status = 'active'"];
    const params = [];

    // 1. Category filter
    if (filters.category) {
      const resolved = await this.resolveCategoryIds(filters.category);
      if (!resolved) {
        return {
          products: [],
          meta: { page, limit, total: 0, totalPages: 0 },
        };
      }
      whereConditions.push(`p.category_id IN (${resolved.categoryIds.map(() => '?').join(', ')})`);
      params.push(...resolved.categoryIds);
    }

    // 2. Search query (matches name, descriptions, material, category)
    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      whereConditions.push(
        '(p.name LIKE ? OR p.short_description LIKE ? OR p.description LIKE ? OR p.material LIKE ? OR c.name LIKE ?)'
      );
      params.push(term, term, term, term, term);
    }

    // 3. Featured filter
    if (filters.featured === 'true' || filters.featured === '1' || filters.featured === true) {
      whereConditions.push('p.is_featured = 1');
    }

    // 4. In-stock filter
    if (filters.in_stock === 'true' || filters.in_stock === '1' || filters.in_stock === true) {
      whereConditions.push(
        'EXISTS (SELECT 1 FROM product_variants pv_st WHERE pv_st.product_id = p.id AND pv_st.is_active = 1 AND (pv_st.stock_quantity - pv_st.reserved_quantity) > 0)'
      );
    }

    // 5. Price filters
    if (filters.min_price !== undefined || filters.max_price !== undefined) {
      let priceCond = 'pv_pr.product_id = p.id AND pv_pr.is_active = 1';
      const priceParams = [];
      if (filters.min_price !== undefined) {
        priceCond += ' AND COALESCE(pv_pr.sale_price, pv_pr.price) >= ?';
        priceParams.push(filters.min_price);
      }
      if (filters.max_price !== undefined) {
        priceCond += ' AND COALESCE(pv_pr.sale_price, pv_pr.price) <= ?';
        priceParams.push(filters.max_price);
      }
      whereConditions.push(`EXISTS (SELECT 1 FROM product_variants pv_pr WHERE ${priceCond})`);
      params.push(...priceParams);
    }

    // 6. Size filter
    if (filters.size && filters.size.trim()) {
      whereConditions.push(
        'EXISTS (SELECT 1 FROM product_variants pv_sz WHERE pv_sz.product_id = p.id AND pv_sz.is_active = 1 AND pv_sz.size = ?)'
      );
      params.push(filters.size.trim());
    }

    // 7. Color filter
    if (filters.color && filters.color.trim()) {
      whereConditions.push(
        'EXISTS (SELECT 1 FROM product_variants pv_cl WHERE pv_cl.product_id = p.id AND pv_cl.is_active = 1 AND pv_cl.color = ?)'
      );
      params.push(filters.color.trim());
    }

    const whereClause = whereConditions.join(' AND ');

    // Count query
    const countSql = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
    `;
    const [[{ total }]] = await pool.query(countSql, params);

    // Sorting whitelist
    let orderByClause = 'ORDER BY p.created_at DESC, p.id DESC';
    const sort = (filters.sort || 'newest').toLowerCase();
    switch (sort) {
      case 'oldest':
        orderByClause = 'ORDER BY p.created_at ASC, p.id ASC';
        break;
      case 'price_asc':
        orderByClause = 'ORDER BY min_price ASC, p.id ASC';
        break;
      case 'price_desc':
        orderByClause = 'ORDER BY max_price DESC, p.id DESC';
        break;
      case 'name_asc':
        orderByClause = 'ORDER BY p.name ASC, p.id ASC';
        break;
      case 'name_desc':
        orderByClause = 'ORDER BY p.name DESC, p.id DESC';
        break;
      default:
        orderByClause = 'ORDER BY p.created_at DESC, p.id DESC';
        break;
    }

    // Main data query
    const querySql = `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.short_description,
        p.is_featured,
        p.created_at,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        MIN(COALESCE(pv.sale_price, pv.price)) AS min_price,
        MAX(COALESCE(pv.sale_price, pv.price)) AS max_price,
        MAX(CASE WHEN (pv.stock_quantity - pv.reserved_quantity) > 0 THEN 1 ELSE 0 END) AS has_stock,
        (
          SELECT JSON_OBJECT('image_url', pi.image_url, 'alt_text', pi.alt_text)
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
          LIMIT 1
        ) AS primary_image_json
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = 1
      WHERE ${whereClause}
      GROUP BY p.id, c.id
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(querySql, [...params, limit, offset]);

    return {
      products: rows.map((r) => this.formatProductCard(r)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    };
  }

  /**
   * Retrieve complete product details by slug or ID
   */
  static async getProductDetails(identifier) {
    const isNumeric = !isNaN(parseInt(identifier, 10)) && /^\d+$/.test(String(identifier).trim());
    const whereCond = isNumeric ? 'p.id = ?' : 'p.slug = ?';
    const paramVal = isNumeric ? parseInt(identifier, 10) : identifier.trim();

    // 1. Fetch product & category
    const [[product]] = await pool.query(
      `SELECT
        p.id,
        p.category_id,
        p.name,
        p.slug,
        p.short_description,
        p.description,
        p.material,
        p.care_instructions,
        p.status,
        p.is_featured,
        p.created_at,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE (${whereCond}) AND p.status = 'active'`,
      [paramVal]
    );

    if (!product) {
      throw AppError.notFound('Product not found or currently unavailable.');
    }

    const productId = product.id;

    // 2. Fetch all images for this product
    const [images] = await pool.query(
      `SELECT id, image_url, alt_text, is_primary, sort_order, variant_id
       FROM product_images
       WHERE product_id = ?
       ORDER BY is_primary DESC, sort_order ASC, id ASC`,
      [productId]
    );

    // 3. Fetch active variants
    const [variants] = await pool.query(
      `SELECT id, sku, size, color, price, sale_price, stock_quantity, reserved_quantity
       FROM product_variants
       WHERE product_id = ? AND is_active = 1
       ORDER BY price ASC, id ASC`,
      [productId]
    );

    // 4. Calculate prices, sizes, colors, and stock
    const formattedVariants = variants.map((v) => {
      const price = parseFloat(v.price);
      const salePrice = v.sale_price ? parseFloat(v.sale_price) : null;
      const effectivePrice = salePrice !== null ? salePrice : price;
      const availableQty = Math.max(0, (v.stock_quantity || 0) - (v.reserved_quantity || 0));

      return {
        id: v.id,
        sku: v.sku,
        size: v.size || null,
        color: v.color || null,
        price,
        sale_price: salePrice,
        effective_price: effectivePrice,
        available_quantity: availableQty,
        is_in_stock: availableQty > 0,
      };
    });

    const sizes = Array.from(
      new Set(formattedVariants.map((v) => v.size).filter(Boolean))
    );
    const colors = Array.from(
      new Set(formattedVariants.map((v) => v.color).filter(Boolean))
    );

    let priceRange = null;
    if (formattedVariants.length > 0) {
      const effectivePrices = formattedVariants.map((v) => v.effective_price);
      priceRange = {
        min: Math.min(...effectivePrices),
        max: Math.max(...effectivePrices),
        currency: 'ETB',
      };
    }

    const hasStock = formattedVariants.some((v) => v.available_quantity > 0);

    // 5. Fetch reviews summary
    const [[reviewSummary]] = await pool.query(
      `SELECT
         COUNT(*) as total_reviews,
         COALESCE(AVG(rating), 0) as average_rating
       FROM product_reviews
       WHERE product_id = ? AND review_status = 'approved'`,
      [productId]
    );

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      short_description: product.short_description || null,
      description: product.description || null,
      material: product.material || null,
      care_instructions: product.care_instructions || null,
      is_featured: Boolean(product.is_featured),
      created_at: product.created_at,
      category: {
        id: product.category_id,
        name: product.category_name,
        slug: product.category_slug,
      },
      price: priceRange,
      stock_status: hasStock ? 'in_stock' : 'out_of_stock',
      sizes,
      colors,
      images: images.map((img) => ({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text || null,
        is_primary: Boolean(img.is_primary),
        sort_order: img.sort_order,
        variant_id: img.variant_id || null,
      })),
      variants: formattedVariants,
      reviews_summary: {
        average_rating: parseFloat(Number(reviewSummary.average_rating).toFixed(1)),
        total_reviews: parseInt(reviewSummary.total_reviews, 10),
      },
    };
  }

  /**
   * Retrieve active categories with active product counts in a hierarchical tree
   */
  static async getCategories() {
    const [categories] = await pool.query(
      `SELECT
         c.id,
         c.parent_id,
         c.name,
         c.slug,
         c.description,
         c.image_url,
         c.sort_order,
         (
           SELECT COUNT(*)
           FROM products p
           WHERE p.status = 'active'
             AND (p.category_id = c.id OR p.category_id IN (
               SELECT child.id FROM categories child WHERE child.parent_id = c.id
             ))
         ) AS product_count
       FROM categories c
       WHERE c.is_active = 1
       ORDER BY c.sort_order ASC, c.name ASC`
    );

    // Build hierarchy: root categories have parent_id == null
    const categoryMap = new Map();
    const roots = [];

    for (const cat of categories) {
      categoryMap.set(cat.id, {
        id: cat.id,
        parent_id: cat.parent_id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || null,
        image_url: cat.image_url || null,
        product_count: parseInt(cat.product_count, 10) || 0,
        subcategories: [],
      });
    }

    for (const cat of categoryMap.values()) {
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        categoryMap.get(cat.parent_id).subcategories.push(cat);
      } else if (!cat.parent_id) {
        roots.push(cat);
      }
    }

    return roots;
  }

  /**
   * Retrieve products belonging to a category (and its subcategories)
   */
  static async getCategoryProducts(categorySlug, filters = {}) {
    const [[category]] = await pool.query(
      'SELECT id, parent_id, name, slug, description, image_url FROM categories WHERE slug = ? AND is_active = 1',
      [categorySlug]
    );

    if (!category) {
      throw AppError.notFound('Category not found.');
    }

    const result = await this.getProducts({
      ...filters,
      category: categorySlug,
    });

    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || null,
        image_url: category.image_url || null,
      },
      ...result,
    };
  }

  /**
   * Retrieve featured active products
   */
  static async getFeaturedProducts(limit = 8) {
    const result = await this.getProducts({
      featured: true,
      limit,
      page: 1,
      sort: 'newest',
    });
    return result.products;
  }

  /**
   * Retrieve related products based on category, excluding current product
   */
  static async getRelatedProducts(identifier, limit = 4) {
    const isNumeric = !isNaN(parseInt(identifier, 10)) && /^\d+$/.test(String(identifier).trim());
    const whereCond = isNumeric ? 'p.id = ?' : 'p.slug = ?';
    const paramVal = isNumeric ? parseInt(identifier, 10) : identifier.trim();

    const [[current]] = await pool.query(
      `SELECT id, category_id FROM products p WHERE (${whereCond}) AND status = 'active'`,
      [paramVal]
    );

    if (!current) {
      throw AppError.notFound('Product not found.');
    }

    const querySql = `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.short_description,
        p.is_featured,
        p.created_at,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        MIN(COALESCE(pv.sale_price, pv.price)) AS min_price,
        MAX(COALESCE(pv.sale_price, pv.price)) AS max_price,
        MAX(CASE WHEN (pv.stock_quantity - pv.reserved_quantity) > 0 THEN 1 ELSE 0 END) AS has_stock,
        (
          SELECT JSON_OBJECT('image_url', pi.image_url, 'alt_text', pi.alt_text)
          FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
          LIMIT 1
        ) AS primary_image_json
      FROM products p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.is_active = 1
      WHERE p.status = 'active'
        AND p.category_id = ?
        AND p.id != ?
      GROUP BY p.id, c.id
      ORDER BY p.created_at DESC
      LIMIT ?
    `;

    const [rows] = await pool.query(querySql, [current.category_id, current.id, limit]);
    return rows.map((r) => this.formatProductCard(r));
  }
}

module.exports = CatalogService;
