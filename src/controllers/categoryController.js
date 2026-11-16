/**
 * IBTU E-Commerce Backend
 * src/controllers/categoryController.js
 */

const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/response');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    return sendSuccess(res, 200, 'Categories retrieved.', { categories });
  } catch (err) { next(err); }
};

const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);
    const category = isNumeric
      ? await Category.findById(parseInt(id))
      : await Category.findBySlug(id);
    if (!category) return sendError(res, 404, 'Category not found.');
    return sendSuccess(res, 200, 'Category retrieved.', { category });
  } catch (err) { next(err); }
};

const createCategory = async (req, res, next) => {
  try {
    const id = await Category.create(req.body);
    const category = await Category.findById(id);
    return sendSuccess(res, 201, 'Category created.', { category });
  } catch (err) { next(err); }
};

const updateCategory = async (req, res, next) => {
  try {
    const updated = await Category.update(parseInt(req.params.id), req.body);
    if (!updated) return sendError(res, 404, 'Category not found or nothing changed.');
    const category = await Category.findById(parseInt(req.params.id));
    return sendSuccess(res, 200, 'Category updated.', { category });
  } catch (err) { next(err); }
};

const deleteCategory = async (req, res, next) => {
  try {
    const deleted = await Category.delete(parseInt(req.params.id));
    if (!deleted) return sendError(res, 404, 'Category not found.');
    return sendSuccess(res, 200, 'Category deleted.');
  } catch (err) { next(err); }
};

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
