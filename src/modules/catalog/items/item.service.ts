import { parseId } from "../../../common/utils/parseId.js";
import * as itemRepository from "./item.repository.js";
import * as categoryRepository from "../categories/category.repository.js";
import type { CreateItemDto, UpdateItemDto, ListItemsQuery } from "./item.types.js";

const ensureCategoryExists = async (categoryId: bigint) => {
  if (!(await categoryRepository.findById(categoryId))) {
    throw new Error("Category not found");
  }
};

export const create = async (data: CreateItemDto) => {
  const categoryId = parseId(data.categoryId);
  await ensureCategoryExists(categoryId);
  
  if (await itemRepository.findByNameAndCategory(categoryId, data.name)) {
    throw new Error("An item with this name already exists in this category");
  }

  return itemRepository.create({
    categoryId,
    name: data.name,
    unit: data.unit,
    ...(data.description !== undefined && { description: data.description }),
  });
};

export const getById = async (id: string) => {
  const item = await itemRepository.findById(parseId(id));
  if (!item) throw new Error("Item not found");
  return item;
};

export const list = async (query: ListItemsQuery) => {
  const filters = {
    ...(query.categoryId !== undefined && { categoryId: parseId(query.categoryId) }),
    ...(query.search !== undefined && { search: query.search }),
    includeDeleted: query.includeDeleted ?? false,
  };

  const data = await itemRepository.findMany(filters, query.page, query.limit);
  const total = await itemRepository.count(filters);

  return { data, meta: { page: query.page, limit: query.limit, total } };
};

export const update = async (id: string, data: UpdateItemDto) => {
  const itemId = parseId(id);
  const existing = await itemRepository.findById(itemId);
  if (!existing) throw new Error("Item not found");

  const nextCategoryId = data.categoryId !== undefined ? parseId(data.categoryId) : existing.categoryId;
  if (data.categoryId !== undefined) await ensureCategoryExists(nextCategoryId);

  if (data.name !== undefined) {
    const duplicate = await itemRepository.findByNameAndCategory(nextCategoryId, data.name);
    if (duplicate && duplicate.id !== itemId) {
      throw new Error("An item with this name already exists in this category");
    }
  }

  return itemRepository.update(itemId, {
    ...(data.categoryId !== undefined && { categoryId: nextCategoryId }),
    ...(data.name !== undefined && { name: data.name }),
    ...(data.unit !== undefined && { unit: data.unit }),
    ...(data.description !== undefined && { description: data.description }),
  });
};

export const softDelete = async (id: string) => {
  const itemId = parseId(id);
  if (!(await itemRepository.exists(itemId))) throw new Error("Item not found");
  await itemRepository.softDelete(itemId);
};

export const restore = async (id: string) => {
  const itemId = parseId(id);
  if (!(await itemRepository.exists(itemId))) throw new Error("Item not found");
  return itemRepository.restore(itemId);
};