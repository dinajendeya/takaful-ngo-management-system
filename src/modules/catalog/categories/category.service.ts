import { parseId } from "../../../common/utils/parseId.js";
import * as categoryRepository from "./category.repository.js";
import type { CreateCategoryDto, UpdateCategoryDto } from "./category.types.js";

export const create = async (data: CreateCategoryDto) => {
  if (await categoryRepository.findByName(data.name)) {
    throw new Error("A category with this name already exists");
  }

  return categoryRepository.create({
    name: data.name,
    ...(data.description !== undefined && { description: data.description }),
  });
};

export const list = async () => {
  return categoryRepository.findMany();
};

export const getById = async (id: string) => {
  const category = await categoryRepository.findById(parseId(id));
  if (!category) throw new Error("Category not found");
  return category;
};

export const update = async (id: string, data: UpdateCategoryDto) => {
  const categoryId = parseId(id);
  const existing = await categoryRepository.findById(categoryId);
  if (!existing) throw new Error("Category not found");

  if (data.name !== undefined) {
    const duplicate = await categoryRepository.findByName(data.name);
    if (duplicate && duplicate.id !== categoryId) {
      throw new Error("A category with this name already exists");
    }
  }

  return categoryRepository.update(categoryId, data);
};

export const softDelete = async (id: string) => {
  const categoryId = parseId(id);
  
  if (!(await categoryRepository.findById(categoryId))) {
    throw new Error("Category not found");
  }

  const itemCount = await categoryRepository.countItemsInCategory(categoryId);
  if (itemCount > 0) {
    throw new Error("Cannot delete a category that still has items. Move or delete its items first.");
  }

  await categoryRepository.softDelete(categoryId);
};