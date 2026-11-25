import { parseId } from "../../../common/utils/parseId.js";
import * as templateRepository from "./template.repository.js";
import * as itemRepository from "../../catalog/items/item.repository.js";
import type { CreateTemplateDto, UpdateTemplateDto, CreateTemplateData, UpdateTemplateData } from "./template.types.js";

const validateItems = async (items: { itemId: string; quantity: number }[]) => {
  for (const item of items) {
    const itemId = parseId(item.itemId);
    if (!(await itemRepository.findById(itemId))) {
      throw new Error(`Item with ID ${item.itemId} not found`);
    }
  }
};

export const create = async (data: CreateTemplateDto, createdById: string) => {
  if (await templateRepository.findByName(data.name)) {
    throw new Error("A parcel template with this name already exists");
  }

  await validateItems(data.items);

  const createData: CreateTemplateData = {
    name: data.name,
    ...(data.description !== undefined && { description: data.description }),
    createdById: parseId(createdById),
    items: data.items.map((i) => ({
      itemId: parseId(i.itemId),
      quantity: i.quantity,
    })),
  };

  return templateRepository.create(createData);
};

export const list = async () => {
  return templateRepository.findMany();
};

export const getById = async (id: string) => {
  const template = await templateRepository.findById(parseId(id));
  if (!template) throw new Error("Parcel template not found");
  return template;
};

export const update = async (id: string, data: UpdateTemplateDto) => {
  const templateId = parseId(id);
  if (!(await templateRepository.findById(templateId))) {
    throw new Error("Parcel template not found");
  }

  if (data.name !== undefined) {
    const duplicate = await templateRepository.findByName(data.name);
    if (duplicate && duplicate.id !== templateId) {
      throw new Error("A parcel template with this name already exists");
    }
  }

  if (data.items) {
    await validateItems(data.items);
  }

  const updateData: UpdateTemplateData = {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.items && {
      items: data.items.map((i) => ({
        itemId: parseId(i.itemId),
        quantity: i.quantity,
      })),
    }),
  };

  return templateRepository.update(templateId, updateData);
};

export const archive = async (id: string) => {
  const templateId = parseId(id);
  if (!(await templateRepository.findById(templateId))) {
    throw new Error("Parcel template not found");
  }
  await templateRepository.archive(templateId);
};