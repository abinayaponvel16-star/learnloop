const express = require('express');
const authRoutes = require('./authRoutes');
const mentorshipRoutes = require('./mentorshipRoutes');
const sessionRoutes = require('./sessionRoutes');
const resourceRoutes = require('./resourceRoutes');
const ratingRoutes = require('./ratingRoutes');
const notificationRoutes = require('./notificationRoutes');
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/mentorships', mentorshipRoutes);
router.use('/sessions', sessionRoutes);
router.use('/resources', resourceRoutes);
router.use('/ratings', ratingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);

module.exports = router;
