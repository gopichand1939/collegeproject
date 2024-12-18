const express = require('express');
const router = express.Router();

const {

    getUser,
    getSignupPage,
    createUser,
    getLoginPage,
    loginUser,
    updateBasicInfo,
    insertMatriculation,
    insertIntermediate,
    insertGraduation,
    insertSkills,
    insertAchievements,
    deleteUser,
    uploadProfilePhoto,
    logoutUser,
    editProfile,
    deleteSem,
    deleteSkill,
    deleteAchievement,
    deleteMatric,
    deleteInter,
    getHomePage,
    getlgbtqPage,
    getMentalHealthPage,
    getCareerPage,
    getGREPage,
    getMBAPage,
    getmtechPage,
    getRoadMap
} = require('../controllers/user');

const { protect } = require('../middlewares/auth.js')


router.route('/signup').get(getSignupPage).post(createUser);
router.route('/login').get(getLoginPage).post(loginUser);
router.route('/home').get(getHomePage)

router.route('/socialtab/lqbtq').get(getlgbtqPage)
router.route('/socialtab/mentalhealth').get(getMentalHealthPage)

router.route('/career').get(getCareerPage)
router.route('/career/gre').get(getGREPage)
router.route('/career/mba').get(getMBAPage)
router.route('/career/mtech').get(getmtechPage)

router.route('/roadmap').get(getRoadMap)

router.route('/profile').get(protect, getUser)

router.route('/profile/education/matric').post(protect, insertMatriculation)
router.route('/profile/education/inter').post(protect, insertIntermediate)
router.route('/profile/education/graduation').post(protect, insertGraduation)
router.route('/profile/education/skills').post(protect, insertSkills)
router.route('/profile/education/achievement').post(protect, insertAchievements)
router.route('/profile/:id/delete').delete(deleteUser)

router.route('/editprofile').get(protect, editProfile)
router.route('/editprofile/photo').post(protect, uploadProfilePhoto)
router.route('/editprofile/basicinfo').post(protect, updateBasicInfo)
router.route('/editprofile/matric').post(protect, deleteMatric)
router.route('/editprofile/inter').post(protect, deleteInter)
router.route('/editprofile/grad/:id').post(protect, deleteSem)
router.route('/editprofile/skills/:id').post(protect, deleteSkill)
router.route('/editprofile/achievements/:id').post(protect, deleteAchievement)

router.route('/logout').get(protect, logoutUser)

module.exports = router;