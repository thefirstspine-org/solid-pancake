/* tslint:disable:variable-name */
import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, ManyToOne } from 'typeorm';
import { Session } from '../session/session.entity';

/*
TODO: Remove {synchronize: false}
TypeORM is throwing an exception on runtime "the constraint already exists"
No fix for now but deactivating the sync for now
Source: https://github.com/typeorm/typeorm/issues/7738
*/
@Entity({synchronize: false})
export class Event {

  @PrimaryGeneratedColumn()
  event_id?: number;

  @Column({length: 250})
  @ManyToOne(type => Session, session => session.session_id)
  session_id?: string;

  @Column({length: 512})
  category?: string;

  @Column({length: 512})
  event?: string;

  @Column({length: 512, default: ''})
  action?: string;

  @Column({length: 512, default: ''})
  label?: string;

  @Column()
  created_at?: Date;

  @BeforeInsert()
  beforeInsert() {
    this.created_at = new Date();
  }

  @ManyToOne(() => Session, session => session.session_id)
  session?: Session;
}
