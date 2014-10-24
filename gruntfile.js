// 包装函数
module.exports = function(grunt) {

  // 任务配置
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

  // 任务加载
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-css');
  // 自定义任务
  grunt.registerTask('default', ['uglify', 'cssmin']);
};