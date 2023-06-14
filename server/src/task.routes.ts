import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { collections } from './database';

export const taskRouter = express.Router({ mergeParams: true });
taskRouter.use(express.json());

// GET /users/:userId/tasks
taskRouter.get('/:userId/tasks', async (req: Request, res: Response) => {
  const userId = req.params.userId;

  try {
    const tasks = await collections.tasks.find({ userId: new ObjectId(userId) }).toArray();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// GET /users/:userId/tasks/:taskId
taskRouter.get('/:userId/tasks/:taskId', async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const taskId = req.params.taskId;

  try {
    const task = await collections.tasks.findOne({ _id: new ObjectId(taskId), userId: new ObjectId(userId) });

    if (task) {
      res.status(200).json(task);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve task' });
  }
});

// POST /users/:userId/tasks
taskRouter.post('/:userId/tasks', async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const task = req.body;
  task.userId = new ObjectId(userId);

  try {
    const result = await collections.tasks.insertOne(task);
    res.status(201).json({ message: 'Task created successfully', taskId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /users/:userId/tasks/:taskId
taskRouter.put('/:userId/tasks/:taskId', async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const taskId = req.params.taskId;
  const task = req.body;

  try {
    const result = await collections.tasks.updateOne({ _id: new ObjectId(taskId), userId: new ObjectId(userId) }, { $set: task });

    if (result.matchedCount) {
      res.status(200).json({ message: 'Task updated successfully' });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /users/:userId/tasks/:taskId
taskRouter.delete('/:userId/tasks/:taskId', async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const taskId = req.params.taskId;

  try {
    const result = await collections.tasks.deleteOne({ _id: new ObjectId(taskId), userId: new ObjectId(userId) });

    if (result.deletedCount) {
      res.status(200).json({ message: 'Task deleted successfully' });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default taskRouter;