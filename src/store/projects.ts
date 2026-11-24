/**
 * Saved projects.
 *
 * Components talk to `ProjectRepository`, never to storage directly. The
 * default implementation persists to localStorage. To move to Supabase,
 * implement the same interface against a `projects` table
 * (id uuid, user_id uuid, name text, design jsonb, thumbnail text,
 * created_at, updated_at) and swap it in `setProjectRepository` once a user
 * signs in — nothing else in the app needs to change.
 */
import { create } from 'zustand';
import type { SavedProject } from './types';

export interface ProjectRepository {
  list(): Promise<SavedProject[]>;
  get(id: string): Promise<SavedProject | null>;
  save(project: SavedProject): Promise<SavedProject>;
  remove(id: string): Promise<void>;
}

const KEY = 'rt.projects.v1';

export class LocalProjectRepository implements ProjectRepository {
  private read(): SavedProject[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]') as SavedProject[];
    } catch {
      return [];
    }
  }
  private write(list: SavedProject[]) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      // Quota exceeded: retry without thumbnails before giving up.
      localStorage.setItem(KEY, JSON.stringify(list.map((p) => ({ ...p, thumbnail: undefined }))));
    }
  }
  async list() {
    return this.read().sort((a, b) => b.updatedAt - a.updatedAt);
  }
  async get(id: string) {
    return this.read().find((p) => p.id === id) ?? null;
  }
  async save(project: SavedProject) {
    const list = this.read().filter((p) => p.id !== project.id);
    list.push(project);
    this.write(list);
    return project;
  }
  async remove(id: string) {
    this.write(this.read().filter((p) => p.id !== id));
  }
}

let repo: ProjectRepository = new LocalProjectRepository();
export const setProjectRepository = (r: ProjectRepository) => {
  repo = r;
  void useProjects.getState().refresh();
};

interface ProjectsState {
  projects: SavedProject[];
  refresh: () => Promise<void>;
  save: (p: Omit<SavedProject, 'id' | 'createdAt' | 'updatedAt'> & { id?: string | null }) => Promise<SavedProject>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => Promise<SavedProject | null>;
}

export const useProjects = create<ProjectsState>()((set, get) => ({
  projects: [],
  refresh: async () => set({ projects: await repo.list() }),
  save: async (p) => {
    const now = Date.now();
    const existing = p.id ? await repo.get(p.id) : null;
    const saved = await repo.save({
      ...p,
      id: existing?.id ?? p.id ?? `p${now.toString(36)}`,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    await get().refresh();
    return saved;
  },
  remove: async (id) => {
    await repo.remove(id);
    await get().refresh();
  },
  get: (id) => repo.get(id),
}));

void useProjects.getState().refresh();
