import { jest, expect, it, describe, mock } from "bun:test";
import xlsxPopulate from "xlsx-populate";
import { app } from '../src/.';
import { createSheet, DATA_VALIDATION_MAP, setCell } from "../src/logic";


const CREATE_BODY = {
  "columns": [
    {
      "name": "A",
      "type": "boolean"
    },
    {
      "name": "B",
      "type": "int"
    },
    {
      "name": "C",
      "type": "double"
    },
    {
      "name": "D",
      "type": "string"
    }
  ]
}
const COL = "A"
const ROW = 13

const PATCH_BODY = { "value": true, "row": ROW, "column": COL }
const PATCH_BODY2 = { "value": `LOOKUP('${COL}${ROW}')`, "row": ROW - 1, "column": COL }
describe('ETE', () => {
  it('return a response', async () => {
    expect((await app
      .handle(new Request('http://localhost:3000/sheet', { body: JSON.stringify(CREATE_BODY), method: 'POST', headers: { "Content-Type": "application/json" } }))).ok).toBe(true)

    expect(await app
      .handle(new Request('http://localhost:3000/sheet/1', { body: JSON.stringify(PATCH_BODY), method: 'PATCH', headers: { "Content-Type": "application/json" } }))
      .then(x => x.ok)).toBe(true)

    expect(await app
      .handle(new Request('http://localhost:3000/sheet/1', { body: JSON.stringify(PATCH_BODY2), method: 'PATCH', headers: { "Content-Type": "application/json" } }))
      .then(x => x.ok)).toBe(true)


    const xlsx = (await xlsxPopulate.fromFileAsync('public/1.xlsx')).sheet(0)
    expect(await app.handle(new Request('http://localhost:3000/sheet/1')).then(x => x.arrayBuffer()).then(x => xlsxPopulate.fromDataAsync(x)).then(wb => wb.sheet(0).cell(`${COL}${ROW}`).value()?.toString())).toBe(xlsx.cell(`${COL}${ROW}`).value()?.toString() || "FAIL")

    expect(await app.handle(new Request('http://localhost:3000/sheet/1')).then(x => x.arrayBuffer()).then(x => xlsxPopulate.fromDataAsync(x)).then(wb => wb.sheet(0).cell(`${COL}${ROW - 1}`).value()?.toString())).toBe(xlsx.cell(`${COL}${ROW - 1}`).value()?.toString() || "FAIL")
  })
})
