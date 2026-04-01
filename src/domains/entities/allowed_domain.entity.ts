import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('allowed_domains')
export class AllowedDomain {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    domain: string; 

    @Column({nullable: true})
    description: string;

    @Column({default: true})
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

}
