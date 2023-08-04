import { NotFoundException } from '@nestjs/common';
import { BaseEntity, Repository } from 'typeorm';

import { GetByFieldsInput } from './dto/get-by-fields-input.dto';

export class BaseService<Entity extends BaseEntity> {
  constructor(private readonly repository: Repository<Entity>) {}

  /**
   * Retrieves a single entity from the database based on the provided fields.
   * @param input An object containing fields, relations, checkIfExists, and loadRelationIds properties.
   * @returns The retrieved entity or undefined if not found.
   * @throws NotFoundException if checkIfExists is true and the entity is not found.
   */
  public async getOneByFields(
    input: GetByFieldsInput,
  ): Promise<Entity | undefined> {
    const { fields, relations, checkIfExists = false, loadRelationIds } = input;

    // create a simpler fields object to use in the database query
    const fieldsToDoWhere = {};
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === 'object' && value.hasOwnProperty('id')) {
        fieldsToDoWhere[key] = {
          id: value.id,
        };
      } else {
        fieldsToDoWhere[key] = value;
      }
    }

    // determine whether to load relation ids or not
    let loadRelationIdsToUse = loadRelationIds;
    if (loadRelationIdsToUse === undefined) {
      loadRelationIdsToUse = relations?.length ? false : true;
    }

    // query the database for the entity
    const existing = await this.repository.findOne({
      where: { ...(fieldsToDoWhere as any) },
      relations,
      loadRelationIds: loadRelationIdsToUse,
    });

    // throw an exception if the entity is not found and checkIfExists is true
    if (!existing && checkIfExists) {
      const values = Object.keys(fields)
        .map(
          (key) =>
            `${key} = ${
              typeof fields[key] === 'object' && fields[key]
                ? fields[key].id
                : fields[key]
            }`,
        )
        .join(' | ');

      throw new NotFoundException(
        `can't get the ${this.repository.metadata.tableName} with the values: ${values}.`,
      );
    }

    return existing || undefined;
  }

  public async getManyByFields(input: GetByFieldsInput): Promise<Entity[]> {
    const { fields, relations } = input;

    // create a simpler fields object
    const fieldsToDoWhere = {};
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === 'object' && value.hasOwnProperty('id')) {
        fieldsToDoWhere[key] = {
          id: value.id,
        };
      } else {
        fieldsToDoWhere[key] = value;
      }
    }

    return await this.repository.find({
      loadRelationIds: !relations?.length ? true : false,
      where: { ...(fieldsToDoWhere as any) },
      relations,
    });
  }
}
