import { Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import { Id } from 'objection';
import { Bag, Cuboid } from '../models';

export const list = async (req: Request, res: Response): Promise<Response> => {
  const ids = req.query.ids as Id[];
  const cuboids = await Cuboid.query().findByIds(ids).withGraphFetched('bag');

  return res.status(200).json(cuboids);
};

export const get = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params.id;
  const cuboid = await Cuboid.query().findById(id).withGraphFetched('bag');

  if (!cuboid) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  return res.status(200).json(cuboid);
};

export const create = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { width, height, depth, bagId } = req.body;

  const bag = await Bag.query().findById(bagId).withGraphFetched('cuboids');

  if (!bag) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  const volume = width * height * depth;

  if (volume > bag.availableVolume) {
    return res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json({ message: 'Insufficient capacity in bag' });
  }

  const cuboid = await Cuboid.query().insert({
    width,
    height,
    depth,
    bagId,
  });

  return res.status(HttpStatus.CREATED).json(cuboid);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const [newWidth, newHeight, newDepth] = req.body;

  const cuboid = await Cuboid.query().findById(id).withGraphFetched('bag');

  if (!cuboid) {
    return res.sendStatus(HttpStatus.NOT_FOUND);
  }

  const availableVolume = cuboid.volume + cuboid.bag.availableVolume;
  const newVolume = newWidth * newHeight * newDepth;

  if (newVolume > availableVolume) {
    return res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json({ message: 'Insufficient capacity in bag' });
  }

  const newCuboid = await cuboid
    .$query()
    .updateAndFetch({
      width: newWidth,
      height: newHeight,
      depth: newDepth,
    })
    .withGraphFetched('bag');
  console.log(newCuboid);
  return res.status(HttpStatus.OK).json(newCuboid);
};
