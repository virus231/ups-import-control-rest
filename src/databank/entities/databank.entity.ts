import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'import_control' })
export class Databank {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  account_nr: string;

  @Column()
  name: string;

  @Column()
  check_markup: number;

  @Column()
  dropbox_folder: string;
}
