import { parseId } from "../../../common/utils/parseId.js";
import * as itemRepository from "./item.repository.js";
import * as categoryRepository from "../categories/category.repository.js";
import type { CreateItemDto, UpdateItemDto, ListItemsQuery, ItemFilters } from "./item.types.js";

const ensureCategoryExists = async (categoryId: bigint) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) throw new Error("Category not found");
  return category;
};

const toItemPublic = ({ deletedAt: _deletedAt, ...rest }: ItemPublic & { deletedAt: Date | null }): ItemPublic => rest;

export const create = async (data: CreateItemDto): Promise<ItemPublic> => {
  const categoryId = parseId(data.categoryId);
  await ensureCategoryExists(categoryId);
  if (await itemRepository.findByNameAndCategory(categoryId, data.name)) {
    throw new Error("An item with this name already exists in this category");
  }
  const item = await itemRepository.create({
    categoryId,
    name: data.name,
    unit: data.unit,
    ...(data.description !== undefined && { description: data.description }),
  });
  return toItemPublic(item);
};

export const getById = async (id: string): Promise<ItemPublic> => {
  const item = await itemRepository.findById(parseId(id));
  if (!item) throw new Error("Item not found");
  return toItemPublic(item);
};

export const list = async (query: ListItemsQuery): Promise<ListItemsResult> => {
  const filters: ItemFilters = {
    ...(query.categoryId !== undefined && { categoryId: parseId(query.categoryId) }),
    ...(query.search !== undefined && { search: query.search }),
    includeDeleted: query.includeDeleted ?? false,
  };
  const [data, total] = await Promise.all([
    itemRepository.findMany(filters, query.page, query.limit),
    itemRepository.count(filters),
  ]);
  return { data: data.map(toItemPublic), meta: { page: query.page, limit: query.limit, total } };
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

  const item = await itemRepository.update(itemId, {
    ...(data.categoryId !== undefined && { categoryId: nextCategoryId }),
    ...(data.name !== undefined && { name: data.name }),
    ...(data.unit !== undefined && { unit: data.unit }),
    ...(data.description !== undefined && { description: data.description }),
  });
  return toItemPublic(item);
};

export const softDelete = async (id: string) => {
  const itemId = parseId(id);
  if (!(await itemRepository.exists(itemId))) throw new Error("Item not found");
  await itemRepository.softDelete(itemId);
};

export const restore = async (id: string) => {
  const itemId = parseId(id);
  if (!(await itemRepository.exists(itemId))) throw new Error("Item not found");
  const item = await itemRepository.restore(itemId);
  return toItemPublic(item);
};