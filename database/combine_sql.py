import shutil

# Copy the Hibernate schema as the new FRESH_SETUP (schema only, no seed data)
shutil.copy('HIBERNATE_GENERATED_SCHEMA.sql', 'FRESH_SETUP.sql')

print("✅ FRESH_SETUP.sql updated (schema only, no seed data)")
