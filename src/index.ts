import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from '@elysiajs/static'
import xlsxPopulate from 'xlsx-populate';
import XlsxPopulate from "xlsx-populate";

const dataValidationMap = {
  string: { type: 'textLength', formula1: '(val)=>typeof val === "string"' },
  double: { type: 'decimal', formula1: '(val)=>typeof val === "number" && val.toFixed()!=val' },
  int: { type: 'whole', formula1: '(val)=>typeof val === "number" && val.toFixed()==val' },
  boolean: {
    type: 'list', formula1: "(val)=>typeof val === 'boolean'"
  }
} as const;

const LOOPUP_REGEX = /^lookup\('[A-Z]\d+'\)$/i;
type dataValidationKeys = keyof typeof dataValidationMap;

// Extract the types from the schemeV array=
const transfromTypeToDataValidtion = (type: dataValidationKeys) => dataValidationMap[type] as any

const LOOKUP = (cell: string) => (ws: xlsxPopulate.Sheet, visitedCells = new Set()) => {
  const currentCell = ws.cell(cell);
  if (!currentCell.dataValidation()) {
    return ws.cell(cell).value();
  }
  if (visitedCells.has(cell)) {
    throw "Circular reference detected!";
  }
  visitedCells.add(cell);
  return eval((currentCell.dataValidation() as any).formula1.toUpperCase())(ws, visitedCells)
}

const handleLookup = (lookupString: string, ws: XlsxPopulate.Sheet, cell: XlsxPopulate.Cell) => {
  const cellValue = eval(lookupString.toUpperCase())(ws)
  cell.dataValidation(lookupString.toUpperCase() as any)
  return cellValue
}

const app = new Elysia()
  .use(staticPlugin())
  .state('currid', 1)
  .use(cors())
  .post("/sheet", async ({ body, store }) => {
    const sheetID = store.currid.toString()
    store.currid = store.currid + 1
    return await xlsxPopulate.fromBlankAsync().then(wb => {
      const ws = wb.sheet(0)
      body.columns.map((col, i) => {
        ws.cell(1, i + 1).value(col.name)
        ws.cell(1, i + 1).dataValidation(transfromTypeToDataValidtion(col.type as dataValidationKeys))
      })
      return wb.toFileAsync(`public/${sheetID}.xlsx`)
    })
  }, {
    body: t.Object({
      columns: t.Array(t.Object({
        name: t.String(),
        type: t.Union(Object.keys(dataValidationMap).map(x => t.String({ pattern: x })))
      }))
    })
  })

  .patch("sheet/:id", async ({ params: { id }, body }) => {
    const wb = await xlsxPopulate.fromFileAsync(`public/${id}.xlsx`)
    const ws = wb.sheet(0)

    const cell = ws.cell(`${body.column}${body.row}`)
    const validationCell = ws.cell(`${body.column}1`).dataValidation() as { type: string, formula1: string }

    const cellValue = (body.value.toUpperCase && (LOOPUP_REGEX.test(body.value.toUpperCase()))) ? handleLookup(body.value, ws, cell) : body.value

    if (eval(validationCell.formula1)(cellValue)) {
      cell.value(cellValue)
    } else {
      throw `data of typof ${typeof body.value} does not match ${validationCell.type}`
    }
    return wb.toFileAsync(`public/${id}.xlsx`)

  }
    , { body: t.Object({ value: t.Any(), row: t.Integer({}), column: t.String({ maxLength: 3, minLength: 1 }) }) }
  )


  .get("/sheet/:id", ({ params: { id } }) => Bun.file(`public/${id}.xlsx`))
  .get("/mike", () => ({ name: "joe" }))
  .get("/joe", () => ({ name: "robert" }))
  .get("/robert", () => ({ name: "mike" }))
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
