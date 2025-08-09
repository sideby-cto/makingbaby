import { Router } from 'express';
import { randomUUID } from 'crypto';

export type StoryType = 'SW' | 'LL';

export interface Story {
  id: string;
  type: StoryType;
  author?: string;
  userId?: string;
  storyAction?: string;
  storyExperience?: string;
  storyObservation?: string;
  likes: number;
  high5s: number;
  Insighfuls: number;
  successSigns: string[];
  studentCharacteristics: string[];
  promisingPractices: string[];
  files: string[];
  district?: string;
  school?: string;
  taggedUsersId: string[];
}

const stories: Story[] = [];

export const storiesRouter = Router();

// List all stories
storiesRouter.get('/', (_req, res) => {
  res.json(stories);
});

// Get a single story by id
storiesRouter.get('/:id', (req, res) => {
  const story = stories.find((s) => s.id === req.params.id);
  if (!story) {
    return res.status(404).json({ error: 'Story not found' });
  }
  res.json(story);
});

// Create a new story
storiesRouter.post('/', (req, res) => {
  const data: Partial<Story> = req.body || {};
  const story: Story = {
    id: randomUUID(),
    type: data.type || 'SW',
    author: data.author,
    userId: data.userId,
    storyAction: data.storyAction,
    storyExperience: data.storyExperience,
    storyObservation: data.storyObservation,
    likes: 0,
    high5s: 0,
    Insighfuls: 0,
    successSigns: data.successSigns ?? [],
    studentCharacteristics: data.studentCharacteristics ?? [],
    promisingPractices: data.promisingPractices ?? [],
    files: data.files ?? [],
    district: data.district,
    school: data.school,
    taggedUsersId: data.taggedUsersId ?? [],
  };

  stories.push(story);
  res.status(201).json(story);
});

// Delete a story by id
storiesRouter.delete('/:id', (req, res) => {
  const index = stories.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Story not found' });
  }
  stories.splice(index, 1);
  res.status(204).send();
});

export default storiesRouter;

