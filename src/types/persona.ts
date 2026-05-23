export type PersonaMode = "demo" | "real"
export type DemoPersonaId = "guillaume" | "raphaelle"

export type Persona = {
  id: string
  mode: PersonaMode
  demoId?: DemoPersonaId
  firstName: string
  lastName: string
  age: number
  sex: "M" | "F"
  heightCm: number
  weightKg?: number
}
