import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: 'import_control' })
export class Databank {
  @PrimaryColumn()
  account_nr: string;

  @Column()
  name: string;

  @Column()
  check_markup: number;

  @Column()
  dropbox_folder: string;
}
