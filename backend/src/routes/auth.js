const router = require('express').Router();
const passport = require('passport');
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google'), (req, res) => {
  res.redirect(process.env.FRONTEND_URL || 'http://localhost:4001');
});
router.get('/current-user', (req, res) => {
  if (req.user) res.json(req.user);
  else res.status(401).json({ message: 'Not authenticated' });
});
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:4001');
  });
});
module.exports = router;
