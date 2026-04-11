/* tslint:disable:variable-name */
import { Entity, Column, PrimaryGeneratedColumn, Unique, BeforeInsert, OneToMany, PrimaryColumn } from 'typeorm';
import { Event } from '../event/event.entity';

@Entity()
@Unique('session_id', ['session_id'])
export class Session {

  @PrimaryColumn({length: 250})
  session_id?: string;

  @Column({length: 250})
  product?: string;

  @Column({length: 250, default: ''})
  label?: string;

  @Column({length: 250, default: ''})
  version?: string;

  @Column()
  created_at?: Date;

  @OneToMany(() => Event, event => event.session_id)
  events?: Event[];

  @BeforeInsert()
  beforeInsert() {
    this.created_at = new Date();
  }

}
