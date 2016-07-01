const gulp = require('gulp')
const qiniu = require('gulp-qiniu')

const version = require('./app/package.json').version

const uploadToQiniu = (dir) => {
  return qiniu({
    accessKey: '_mX0iYymFfBstrzi70-68KkcWG65_fmchOm5LKB9',
    secretKey: 'kTV_BxuW25yFoXi9WqmAWAiVXIb_-HRsR6Gq1LOM',
    bucket: 'ultron',
    private: false
  }, {
    dir: dir
  })
}

gulp.task('package', function() {
  return gulp.src('./app/package.json')
    .pipe(uploadToQiniu('/'))
})

gulp.task('install.exe', () => {
  return gulp.src('./dist/win/Ultron Setup.exe')
    .pipe(uploadToQiniu(`/${version}`))
})

gulp.task('default', ['package', 'install.exe'])
