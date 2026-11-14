/**
 * IBTU E-Commerce Backend
 * src/services/category.service.js
 *
 * Category Business Logic Service
 * Enforces tree hierarchy constraints, circular reference prevention,
 * slug uniqueness, dependency safety checks, and database queries.
 */

const { pool } = require('../config/database');
const AppError = require('../utils/app-error');

class CategoryService {
  /**
   * Helper to generate a URL-friendly slug from a string
   */
  static generateSlug(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  /**
   * Helper: Check if targetParentId is a descendant of categoryId (circular reference check)
   */
  static async isDescendant(categoryId, targetParentId) {
    if (!targetParentId) return false;
    if (Number(categoryId) === Number(targetParentId)) return true;

    // Traverse upwards from targetParentId to see if we hit categoryId
    let currentId = targetParentId;
    const visited = new Set();

    while (currentId) {
      if (Number(currentId) === Number(categoryId)) return true;
      if (visited.has(currentId)) break; // loop detected
      visited.add(currentId);

      const [rows] = await pool.execute('SELECT parent_id FROM categories WHERE id = ?', [currentId]);
      if (rows.length === 0 || !rows[0].parent_id) break;
      currentId = rows[0].parent_id;
    }

    return false;
  }

  /**
   * Get all categories with filtering, search, and pagination
   */
  static async getAllCategories({
    search,
    parent_id,
    is_active,
    page = 1,
    limit = 50,
  } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    let baseSql = `
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by active status (default to only active if not explicitly specified)
    if (is_active !== undefined) {
      const activeVal = is_active === 'true' || is_active === '1' || is_active === true ? 1 : 0;
      baseSql += ' AND c.is_active = ?';
      params.push(activeVal);
    }

    // Filter by parent_id
    if (parent_id !== undefined) {
      if (parent_id === 'null' || parent_id === 'root') {
        baseSql += ' AND c.parent_id IS NULL';
      } else {
        baseSql += ' AND c.parent_id = ?';
        params.push(Number(parent_id));
      }
    }

    // Search by name or description
    if (search) {
      baseSql += ' AND (c.name LIKE ? OR c.description LIKE ?)';
      const query = `%${search}%`;
      params.push(query, query);
    }

    // Count total matching
    const [countRows] = await pool.execute(`SELECT COUNT(*) AS total ${baseSql}`, params);
    const total = countRows[0]?.total || 0;

    // Select paginated records
    const selectSql = `
      SELECT
        c.id,
        c.parent_id,
        c.name,
        c.slug,
        c.description,
        c.image_url,
        c.is_active,
        c.sort_order,
        c.created_at,
        c.updated_at,
        p.name AS parent_name,
        p.slug AS parent_slug,
        (SELECT COUNT(*) FROM categories sub WHERE sub.parent_id = c.id) AS subcategory_count,
        (SELECT COUNT(*) FROM products prod WHERE prod.category_id = c.id) AS product_count
      ${baseSql}
      ORDER BY c.sort_order ASC, c.name ASC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.execute(selectSql, [...params, limitNum, offset]);

    return {
      categories: rows.map((cat) => ({
        ...cat,
        is_active: Boolean(cat.is_active),
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Get category details by ID or Slug, including parent and immediate children
   */
  static async getCategoryById(identifier) {
    const isNumeric = /^\d+$/.test(identifier);
    const whereClause = isNumeric ? 'c.id = ?' : 'c.slug = ?';

    const [rows] = await pool.execute(
      `SELECT
         c.id,
         c.parent_id,
         c.name,
         c.slug,
         c.description,
         c.image_url,
         c.is_active,
         c.sort_order,
         c.created_at,
         c.updated_at,
         p.name AS parent_name,
         p.slug AS parent_slug,
         (SELECT COUNT(*) FROM products prod WHERE prod.category_id = c.id) AS product_count
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       WHERE ${whereClause}
       LIMIT 1`,
      [identifier]
    );

    if (rows.length === 0) {
      throw new AppError('Category not found.', 404);
    }

    const category = rows[0];

    // Fetch immediate child categories
    const [children] = await pool.execute(
      `SELECT id, name, slug, description, image_url, is_active, sort_order
       FROM categories
       WHERE parent_id = ?
       ORDER BY sort_order ASC, name ASC`,
      [category.id]
    );

    return {
      ...category,
      is_active: Boolean(category.is_active),
      children: children.map((c) => ({ ...c, is_active: Boolean(c.is_active) })),
    };
  }

  /**
   * Create a new category
   */
  static async createCategory(data) {
    const {
      name,
      slug: customSlug,
      parent_id = null,
      description = null,
      image_url = null,
      is_active = 1,
      sort_order = 0,
    } = data;

    // 1. Generate or format slug
    const finalSlug = customSlug ? CategoryService.generateSlug(customSlug) : CategoryService.generateSlug(name);
    if (!finalSlug) {
      throw new AppError('Could not generate a valid URL slug for this category.', 422);
    }

    // 2. Check for duplicate slug
    const [existingSlug] = await pool.execute('SELECT id FROM categories WHERE slug = ? LIMIT 1', [finalSlug]);
    if (existingSlug.length > 0) {
      throw new AppError(`A category with the slug "${finalSlug}" already exists.`, 409, [
        { field: 'slug', message: 'Category slug must be unique.' },
      ]);
    }

    // 3. Verify parent category exists if provided
    let cleanParentId = parent_id ? Number(parent_id) : null;
    if (cleanParentId) {
      const [parentRows] = await pool.execute('SELECT id FROM categories WHERE id = ? LIMIT 1', [cleanParentId]);
      if (parentRows.length === 0) {
        throw new AppError(`Parent category with ID ${cleanParentId} does not exist.`, 400, [
          { field: 'parent_id', message: 'Selected parent category does not exist.' },
        ]);
      }
    }

    // 4. Insert category
    const [result] = await pool.execute(
      `INSERT INTO categories (parent_id, name, slug, description, image_url, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanParentId,
        name.trim(),
        finalSlug,
        description ? description.trim() : null,
        image_url || null,
        is_active ? 1 : 0,
        sort_order || 0,
      ]
    );

    return CategoryService.getCategoryById(result.insertId);
  }

  /**
   * Update category information
   */
  static async updateCategory(id, data) {
    const categoryId = Number(id);

    // 1. Verify category exists
    const [existingRows] = await pool.execute('SELECT * FROM categories WHERE id = ? LIMIT 1', [categoryId]);
    if (existingRows.length === 0) {
      throw new AppError('Category not found.', 404);
    }
    const current = existingRows[0];

    // 2. Validate parent_id changes
    let cleanParentId = current.parent_id;
    if (data.parent_id !== undefined) {
      if (data.parent_id === null || data.parent_id === '') {
        cleanParentId = null;
      } else {
        const newParentId = Number(data.parent_id);

        // Cannot be its own parent
        if (newParentId === categoryId) {
          throw new AppError('A category cannot be its own parent.', 400, [
            { field: 'parent_id', message: 'Self-referencing parent is not allowed.' },
          ]);
        }

        // Verify new parent exists
        const [parentCheck] = await pool.execute('SELECT id FROM categories WHERE id = ? LIMIT 1', [newParentId]);
        if (parentCheck.length === 0) {
          throw new AppError(`Parent category with ID ${newParentId} does not exist.`, 400, [
            { field: 'parent_id', message: 'Selected parent category does not exist.' },
          ]);
        }

        // Prevent circular tree relationships (new parent cannot be a descendant of this category)
        const isLoop = await CategoryService.isDescendant(categoryId, newParentId);
        if (isLoop) {
          throw new AppError(
            'Circular relationship detected: a category cannot be assigned to one of its own subcategories as a parent.',
            400,
            [{ field: 'parent_id', message: 'Circular parent-child relationship not allowed.' }]
          );
        }

        cleanParentId = newParentId;
      }
    }

    // 3. Validate slug uniqueness if slug is being updated
    let finalSlug = current.slug;
    if (data.slug) {
      finalSlug = CategoryService.generateSlug(data.slug);
      const [slugConflict] = await pool.execute(
        'SELECT id FROM categories WHERE slug = ? AND id != ? LIMIT 1',
        [finalSlug, categoryId]
      );
      if (slugConflict.length > 0) {
        throw new AppError(`A category with the slug "${finalSlug}" already exists.`, 409, [
          { field: 'slug', message: 'Category slug must be unique.' },
        ]);
      }
    }

    // 4. Prepare updates
    const updates = [];
    const values = [];

    if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name.trim()); }
    if (data.slug !== undefined) { updates.push('slug = ?'); values.push(finalSlug); }
    if (data.parent_id !== undefined) { updates.push('parent_id = ?'); values.push(cleanParentId); }
    if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description ? data.description.trim() : null); }
    if (data.image_url !== undefined) { updates.push('image_url = ?'); values.push(data.image_url || null); }
    if (data.is_active !== undefined) { updates.push('is_active = ?'); values.push(data.is_active ? 1 : 0); }
    if (data.sort_order !== undefined) { updates.push('sort_order = ?'); values.push(Number(data.sort_order) || 0); }

    if (updates.length > 0) {
      values.push(categoryId);
      await pool.execute(
        `UPDATE categories SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
        values
      );
    }

    return CategoryService.getCategoryById(categoryId);
  }

  /**
   * Delete category safely (only when no children and no products exist)
   */
  static async deleteCategory(id) {
    const categoryId = Number(id);

    // 1. Verify category exists
    const [existingRows] = await pool.execute('SELECT id, name FROM categories WHERE id = ? LIMIT 1', [categoryId]);
    if (existingRows.length === 0) {
      throw new AppError('Category not found.', 404);
    }
    const cat = existingRows[0];

    // 2. Check for child categories
    const [children] = await pool.execute(
      'SELECT COUNT(*) AS child_count FROM categories WHERE parent_id = ?',
      [categoryId]
    );
    if (children[0]?.child_count > 0) {
      throw new AppError(
        `Cannot delete category "${cat.name}" because it contains ${children[0].child_count} subcategories. Please reassign or delete the subcategories first.`,
        400
      );
    }

    // 3. Check for associated products
    const [products] = await pool.execute(
      'SELECT COUNT(*) AS product_count FROM products WHERE category_id = ?',
      [categoryId]
    );
    if (products[0]?.product_count > 0) {
      throw new AppError(
        `Cannot delete category "${cat.name}" because it is currently linked to ${products[0].product_count} products. Please reassign the products first.`,
        400
      );
    }

    // 4. Safe deletion
    await pool.execute('DELETE FROM categories WHERE id = ?', [categoryId]);

    return { id: categoryId, name: cat.name };
  }
}

module.exports = CategoryService;
