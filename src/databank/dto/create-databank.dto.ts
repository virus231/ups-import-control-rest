import {DEPARTMENT_CODE} from "../types";

export class DepartmentDto {
  department: keyof typeof DEPARTMENT_CODE;
}
