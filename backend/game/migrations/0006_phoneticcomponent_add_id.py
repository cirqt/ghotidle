from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0005_alter_phoneticcomponent_options_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            # Drop the existing composite primary key, then add id as BIGSERIAL PK
            sql=[
                'ALTER TABLE "phoneticComponent" DROP CONSTRAINT "phoneticComponent_pkey";',
                'ALTER TABLE "phoneticComponent" ADD COLUMN id BIGSERIAL PRIMARY KEY;',
            ],
            # Reverse: drop the id column and restore the original composite PK
            reverse_sql=[
                'ALTER TABLE "phoneticComponent" DROP COLUMN id;',
                'ALTER TABLE "phoneticComponent" ADD PRIMARY KEY ("wordId", "patternId");',
            ],
        ),
    ]
