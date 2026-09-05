export interface SubCategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  created_at: string;

  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CreateSubCategoryInput {
  category_id: string;
  name: string;
  slug: string;
}

export type UpdateSubCategoryInput =
  Partial<CreateSubCategoryInput>;