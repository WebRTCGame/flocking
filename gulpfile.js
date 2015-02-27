var gulp = require('gulp'); 

// Include Our Plugins
var jshint = require('gulp-jshint');

gulp.task('lint', function() {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('watch', function() {
    gulp.watch('js/*.js', ['lint', 'scripts']);
    //gulp.watch('scss/*.scss', ['sass']);
});

gulp.task('default', ['lint',  'watch']);