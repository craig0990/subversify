import { IsBoolean, IsString } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id?: number;

  @IsString()
  @Column()
  title?: string;

  @Column({ nullable: true})
  description?: string;

  @Column({ default: false })
  completed?: boolean;
}
