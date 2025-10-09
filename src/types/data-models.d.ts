export interface Note {
  id: number // int4
  remote_id: number // int4

  title: string // varchar
  content: string // text

  category_id: number // int4

  created_at?: Date | string // timestamptz
  updated_at?: Date | string // timestamptz

  is_deleted?: number // int2
}

export interface Category {
  id: number // int4
  remote_id: number // int4

  name: string // varchar
  order_index: number // int4

  created_at?: Date | string // timestamptz
  updated_at?: Date | string // timestamptz

  is_deleted?: number // int2
}