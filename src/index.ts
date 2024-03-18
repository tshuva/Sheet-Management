import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from '@elysiajs/static'
import { DATA_VALIDATION_MAP, setCell, createSheet } from "./logic";

export interface PostBody {
  columns: {
    name: string;
    type: string;
  }[];
}
export interface PatchBody {
  value: any;
  row: number;
  column: string;
}
export interface Store {
  currid: number;
}


export const app = new Elysia()
  .use(staticPlugin())
  .state('currid', 1)
  .use(cors())
  .get("/sheet/:id", ({ params: { id } }) => Bun.file(`public/${id}.xlsx`))
  .post("/sheet"
    , async ({ body, store }) =>
      await createSheet(body, store)
    , {
      body: t.Object({
        columns: t.Array(t.Object({
          name: t.String(),
          type: t.Union(Object.keys(DATA_VALIDATION_MAP).map(x => t.String({ pattern: x })))
        }))
      })
    })

  .patch("sheet/:id"
    , async ({ params: { id }, body }) =>
      await setCell(id, body)
    , { body: t.Object({ value: t.Any(), row: t.Integer({}), column: t.String({ maxLength: 3, minLength: 1 }) }) }
  )
  .listen(3000);

console.log(
  `Sheet Management is running at ${app.server?.hostname}:${app.server?.port}`
);
