module.exports = function(grunt) {
	'use strict';

	var isDevelopmentRun = !grunt.option('prod');

	var coverageDir = 'coverage';

	var coverageReporters = [];

	if (isDevelopmentRun) {
		coverageReporters.push({
			type: 'html',
			dir: coverageDir
		});
	} else {
		coverageReporters.push({type: 'text-summary'});
	}

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: ['src/**/*.js']
		},
		clean: {
			coverage: [coverageDir],
			install: [grunt.file.readJSON('.bowerrc').directory]
		},
		karma: {
			options: {
				singleRun: !isDevelopmentRun,
				autoWatch: isDevelopmentRun
			},
			unit: {
				configFile: 'karma.unit.conf.js',
				browsers: ['PhantomJS'],
				coverageReporter: {
					reporters: coverageReporters
				}
			}
		},
		jsdoc : {
			dist : {
				src: ['src/js/*.js'],
				options: {
					destination: 'doc'
				}
			}
		},
		jsdoc2md: {
			oneOutputFile: {
				src: "src/js/dropdown.js",
				dest: "doc/documentation.md"
			}
		},
		shell: {
			install: {
				command: 'node node_modules/bower/bin/bower install'
			}
		},

		jscs: {
			options: {
				config: '.jscsrc'
			},
			files: ['src/**/*.js']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-interactive-shell');
	grunt.loadNpmTasks('grunt-jscs');
	grunt.loadNpmTasks("grunt-jsdoc-to-markdown");
	grunt.loadNpmTasks('grunt-jsdoc');

	grunt.registerTask('install', ['clean:install', 'shell:install']);
	grunt.registerTask('check_style', ['jscs', 'jshint']);
	grunt.registerTask('test', ['check_style', 'clean:coverage', 'karma:unit']);
	grunt.registerTask('build', ['install']);
	grunt.registerTask("doc", "jsdoc2md");
	grunt.registerTask('default', ['build']);
};