// ��װ����
module.exports = function(grunt) {

  // ��������
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
	  options: {  
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'  
      }, 
      build: {
        src: ['src/hierarchy_display.js'],
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
	cssmin: {

		css: {

			src:'src/hierarchy_display.css',

			dest:'build/<%= pkg.name %>.min.css'

		}

	}

  });

  // �������
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-css');
  // �Զ�������
  grunt.registerTask('default', ['uglify', 'cssmin']);
};