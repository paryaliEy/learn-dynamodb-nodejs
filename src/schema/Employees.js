import { z } from "zod";

const EmployeeSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  position: z.string().min(1).max(100),
  department: z.string().min(1).max(100),
  salary: z.number().min(1),
  hireDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});
export default EmployeeSchema;
