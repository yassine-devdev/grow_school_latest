const PocketBase = require('pocketbase/cjs');
const fs = require('fs');

// Initialize PocketBase client
const pb = new PocketBase('http://127.0.0.1:8090');

// Helper function to check if schema backup exists
function checkSchemaBackup() {
  const backupPath = './pb_data/schema_backup.json';
  if (fs.existsSync(backupPath)) {
    console.log('📁 Schema backup found at:', backupPath);
    return true;
  }
  return false;
}

async function setupDatabase() {
  try {
    console.log('🚀 Setting up PocketBase database...');

    // Check for existing schema backup
    checkSchemaBackup();

    // First, let's create an admin user if it doesn't exist
    try {
      await pb.admins.authWithPassword('admin@example.com', 'admin123456');
      console.log('✅ Admin authenticated');
    } catch (error) {
      try {
        await pb.admins.create({
          email: 'admin@example.com',
          password: 'admin123456',
          passwordConfirm: 'admin123456'
        });
        console.log('✅ Admin user created');
        await pb.admins.authWithPassword('admin@example.com', 'admin123456');
      } catch (createError) {
        console.log('ℹ️ Admin setup skipped:', createError.message);
      }
    }

    // Create essential collections
    const collections = [
      {
        name: 'users',
        type: 'auth',
        schema: [
          { name: 'name', type: 'text', required: true },
          { name: 'role', type: 'select', required: true, options: { values: ['student', 'teacher', 'admin'] } },
          { name: 'department', type: 'text' },
          { name: 'avatarUrl', type: 'url' }
        ]
      },
      {
        name: 'learning_paths',
        type: 'base',
        schema: [
          { name: 'title', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'difficulty', type: 'select', options: { values: ['Beginner', 'Intermediate', 'Advanced'] } },
          { name: 'estimatedTime', type: 'text' },
          { name: 'subjects', type: 'json' },
          { name: 'modules', type: 'json' },
          { name: 'createdBy', type: 'text', required: true },
          { name: 'isPublic', type: 'bool' }
        ]
      },
      {
        name: 'journal_entries',
        type: 'base',
        schema: [
          { name: 'userId', type: 'text', required: true },
          { name: 'title', type: 'text', required: true },
          { name: 'content', type: 'text', required: true },
          { name: 'mood', type: 'select', options: { values: ['happy', 'sad', 'excited', 'anxious', 'calm', 'frustrated'] } },
          { name: 'tags', type: 'json' },
          { name: 'isPrivate', type: 'bool' }
        ]
      },
      {
        name: 'mood_entries',
        type: 'base',
        schema: [
          { name: 'userId', type: 'text', required: true },
          { name: 'mood', type: 'select', required: true, options: { values: ['very_happy', 'happy', 'neutral', 'sad', 'very_sad'] } },
          { name: 'energy', type: 'number', required: true },
          { name: 'stress', type: 'number', required: true },
          { name: 'notes', type: 'text' },
          { name: 'date', type: 'date', required: true }
        ]
      },
      {
        name: 'school_classes',
        type: 'base',
        schema: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text' },
          { name: 'teacherId', type: 'text', required: true },
          { name: 'capacity', type: 'number', required: true },
          { name: 'schedule', type: 'json' },
          { name: 'subject', type: 'text', required: true }
        ]
      },
      {
        name: 'class_enrollments',
        type: 'base',
        schema: [
          { name: 'classId', type: 'text', required: true },
          { name: 'studentId', type: 'text', required: true },
          { name: 'enrolledAt', type: 'date', required: true },
          { name: 'status', type: 'select', options: { values: ['enrolled', 'pending', 'dropped'] } }
        ]
      }
    ];

    // Create collections
    for (const collectionData of collections) {
      try {
        await pb.collections.create(collectionData);
        console.log(`✅ Created collection: ${collectionData.name}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️ Collection ${collectionData.name} already exists`);
        } else {
          console.log(`⚠️ Error creating ${collectionData.name}:`, error.message);
        }
      }
    }

    // Create sample users
    const sampleUsers = [
      {
        email: 'teacher@school.com',
        password: 'teacher123',
        passwordConfirm: 'teacher123',
        name: 'John Teacher',
        role: 'teacher',
        department: 'Mathematics'
      },
      {
        email: 'student@school.com',
        password: 'student123',
        passwordConfirm: 'student123',
        name: 'Jane Student',
        role: 'student',
        department: 'Grade 10'
      }
    ];

    for (const userData of sampleUsers) {
      try {
        await pb.collection('users').create(userData);
        console.log(`✅ Created user: ${userData.email}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️ User ${userData.email} already exists`);
        } else {
          console.log(`⚠️ Error creating user ${userData.email}:`, error.message);
        }
      }
    }

    // Create sample learning paths
    const samplePaths = [
      {
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming',
        difficulty: 'Beginner',
        estimatedTime: '4 weeks',
        subjects: ['Programming', 'Web Development'],
        modules: ['Variables', 'Functions', 'Objects'],
        createdBy: 'teacher-123',
        isPublic: true
      },
      {
        title: 'Advanced Mathematics',
        description: 'Advanced calculus and algebra concepts',
        difficulty: 'Advanced',
        estimatedTime: '8 weeks',
        subjects: ['Mathematics'],
        modules: ['Calculus', 'Linear Algebra', 'Statistics'],
        createdBy: 'teacher-123',
        isPublic: true
      }
    ];

    for (const pathData of samplePaths) {
      try {
        await pb.collection('learning_paths').create(pathData);
        console.log(`✅ Created learning path: ${pathData.title}`);
      } catch (error) {
        console.log(`⚠️ Error creating learning path ${pathData.title}:`, error.message);
      }
    }

    console.log('🎉 Database setup complete!');
    console.log('📊 Admin UI: http://127.0.0.1:8090/_/');
    console.log('🔌 API: http://127.0.0.1:8090/api/');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

if (require.main === module) {
  setupDatabase().then(() => process.exit(0));
}

module.exports = { setupDatabase };
