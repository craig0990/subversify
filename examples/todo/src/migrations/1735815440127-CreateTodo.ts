import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTodo1735815440127 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE todo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT DEFAULT NULL,
                completed BOOLEAN NOT NULL DEFAULT 0
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE todo`);
    }

}
