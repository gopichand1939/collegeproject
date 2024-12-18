const User = require('../models/User');
const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const path = require('path');


// Get Signup Page
// /api/v1/signup
exports.getSignupPage = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token
  }

  //Make sure token exists
  if (!token) {
    res.render('signup')
  } else {
    res.redirect('/api/v1/profile')
  }

});




// Create User
// /api/v1/signup
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  //Generating Token
  let token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  }

  res
    .status(200)
    .cookie('token', token, options)
    .redirect('/api/v1/profile')
});




// Get Login Page
// /api/v1/login
exports.getLoginPage = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    token = req.cookies.token
  }

  //Make sure token exists
  if (!token) {
    res.render('login');
  } else {
    res.redirect('/api/v1/home')
  }

});




// Logging User
// /api/v1/login
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email: email }).select('+password');

  if (!email || !password) {
    return next(new errorResponse('Please enter an Email or Password', 401))
  }

  //Checking if User Exists
  if (!user) {
    return next(new errorResponse('Invalid Credentials', 401))
  }


  const isMatch = await user.checkPassword(password);

  //Checking if Password is Right
  if (!isMatch) {
    return next(new errorResponse('Invalid Credentials', 401))
  }

  //Generating Token
  let token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
  }

  res
    .status(200)
    .cookie('token', token, options)
    .redirect('/api/v1/home')
});




//Gets Currently Logged user in the profile Page
// api/v1/profile
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = req.user;


  res.render('profilepage', { user: user })
});




//Updating Basic Info of User
// api/v1/editprofile/basicinfo
exports.updateBasicInfo = asyncHandler(async (req, res, next) => {
  let user = await User.updateOne({ _id: req.user.id }, req.body, {
    runValidators: true,
    new: true,
  });

  if (!user) {
    return next(new errorResponse(`User With id ${req.user.id} Not Found`));
  }

  if (req.files) {
    const files = req.files["photo"];
    console.log(files);
    if (!files.mimetype.startsWith('image')) {
      return next(new errorResponse(`Please Upload an Image File Type`, 400));
    }

    if (!files.size > process.env.MAX_PIC_SIZE) {
      return next(new errorResponse(`Image Size Limit Exceeded`, 400));
    }

    files.name = `photo_${Date.now()}_${req.user.id}${path.parse(files.name).ext}`;
    console.log(files.name);
    files.mv(`${process.env.FILE_UPLOAD_PATH}/${files.name}`, async (err) => {
      if (err) {
        console.log(err);
        return next(new errorResponse(`Server Error`, 500));
      }

      await User.findByIdAndUpdate(req.user.id, { photo: files.name }, { runValidators: true, new: true });
    });
  }


  res
    .status(200)
    .redirect('/api/v1/editprofile')
});




// Inserting Matriculation Marks of the student
// api/v1/profile/education/matric
exports.insertMatriculation = asyncHandler(async (req, res, next) => {

  let user = await User.findById(req.user.id);

  if (!user) {
    return next(new errorResponse(`User With id ${req.user.id} Not Found`));
  }


  user = await User.findByIdAndUpdate(req.user.id, { matriculation: req.body }, { new: true })

  let rating = user.calcRating();
  user = await User.findByIdAndUpdate(req.user.id, { rating: rating })

  res.redirect('/api/v1/profile')

});


// Inserting Intermediate Marks of the student
// api/v1/profile/education/matric
exports.insertIntermediate = asyncHandler(async (req, res, next) => {

  let user = await User.findById(req.user.id);

  if (!user) {
    return next(new errorResponse(`User With id ${req.user.id} Not Found`));
  }

  user = await User.findByIdAndUpdate(req.user.id, { intermediate: req.body }, { new: true })

  let rating = user.calcRating();
  user = await User.findByIdAndUpdate(req.user.id, { rating: rating })

  res.redirect('/api/v1/profile')

});

// Inserting Graduation Marks of the student
// api/v1/profile/education/graduation
exports.insertGraduation = asyncHandler(async (req, res, next) => {

  let user = await User.findById(req.user.id);

  if (!user) {
    return next(new errorResponse(`User With id ${req.user.id} Not Found`));
  }
  user = await User.findByIdAndUpdate(req.user.id, { $push: { graduation: req.body } }, { new: true, runValidators: false })

  let rating = user.calcRating();
  user = await User.findByIdAndUpdate(req.user.id, { rating: rating })

  res.redirect('/api/v1/profile')

});

// Inserting Skills 
// api/v1/profile/education/skills
exports.insertSkills = asyncHandler(async (req, res, next) => {

  let user = await User.findById(req.user.id);

  if (!user) {
    return next(new errorResponse(`User With id ${req.user.id} Not Found`));
  }

  user = await User.findByIdAndUpdate(req.user.id, { $push: { skills: req.body } }, { new: true })

  let rating = user.calcRating();
  user = await User.findByIdAndUpdate(req.user.id, { rating: rating })

  res.redirect('/api/v1/profile')
});



// Inserting Achievement And Responsibilities
// api/v1/profile/education/achievement
exports.insertAchievements = asyncHandler(async (req, res, next) => {

  let user = await User.findById(req.user.id);

  if (!user) {
    return next(new errorResponse(`User With id ${req.user.id} Not Found`));
  }

  user = await User.findByIdAndUpdate(req.user.id, { $push: { achievements: req.body } }, { new: true })

  let rating = user.calcRating();
  user = await User.findByIdAndUpdate(req.user.id, { rating: rating })

  res.redirect('/api/v1/profile')

});



// Uploading Profile photo of the user
// api/v1/user/editprofile/photo
exports.uploadProfilePhoto = asyncHandler(async (req, res, next) => {


  let user = await User.findById(req.user.id);

  if (!user) {
    return next(
      new errorResponse(`User with ID ${req.params.id} Not Found `, 400)
    );
  }
  console.log(req.files);

  const files = req.files["photo"];
  console.log(files);
  if (!req.files) {
    return next(new errorResponse(`Image Not Found`, 404));
  }

  if (!files.mimetype.startsWith('image')) {
    return next(new errorResponse(`Please Upload an Image File Type`, 400));
  }

  if (!files.size > process.env.MAX_PIC_SIZE) {
    return next(new errorResponse(`Image Size Limit Exceeded`, 400));
  }

  files.name = `photo_${Date.now()}_${req.user.id}${path.parse(files.name).ext}`;
  console.log(files.name);
  files.mv(`${process.env.FILE_UPLOAD_PATH}/${files.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new errorResponse(`Server Error`, 500));
    }

    await User.findByIdAndUpdate(req.user.id, { photo: files.name }, { runValidators: true, new: true });

    res.status(200).json({ success: true, data: files.name });
  });
});



//Deleting User
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new errorResponse(`User With id ${req.params.id} Not Found`));
  }

  res.status(200).json({
    success: true,
    data: `Deleting User with id ${req.params.id}`,
    user,
  });
});



//Logout Existing User 
exports.logoutUser = asyncHandler(async (req, res, next) => {

  req.user = undefined;
  res
    .cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    })

    .render('login')

})




exports.editProfile = asyncHandler(async (req, res, next) => {
  const user = req.user;
  res.render('editprofile', { user: user })

})

// Deleting matriculation
// api/v1/user/editprofile/matric
exports.deleteMatric = asyncHandler(async (req, res, next) => {
  id = req.params.id;
  await User.updateOne({ id: id }, { $unset: { "matriculation": "" } }, { new: true })

  let user = await User.findById(req.user.id)
  let rating = user.calcRating();

  user = await User.findByIdAndUpdate(req.user.id, { rating: rating })

  res.status(200).redirect('/api/v1/editprofile')
})


// Deleting intermediate
// api/v1/user/editprofile/inter
exports.deleteInter = asyncHandler(async (req, res, next) => {
  id = req.params.id;
  await User.updateOne({ id: id }, { $unset: { "intermediate": "" } }, { new: true })

  let user = await User.findById(req.user.id)
  let rating = user.calcRating();

  user = await User.findByIdAndUpdate(req.user.id, { rating: rating })

  res.status(200).redirect('/api/v1/editprofile')
})



// Deleting a semester
// api/v1/user/editprofile/grad/:id
exports.deleteSem = asyncHandler(async (req, res, next) => {
  id = req.params.id;

  await User.updateOne({ "_id": req.user.id }, { "$pull": { "graduation": { "_id": id } } }, { "multi": true })

  let user = await User.findById(req.user.id)
  let rating = user.calcRating();

  user = await User.findByIdAndUpdate(req.user.id, { rating: rating })

  res.status(200).redirect('/api/v1/editprofile')
})



// Deleting a skill
// api/v1/user/editprofile/skills/:id
exports.deleteSkill = asyncHandler(async (req, res, next) => {

  id = req.params.id;
  await User.updateOne({ "_id": req.user.id }, { "$pull": { "skills": { "_id": id } } }, { "multi": true })

  let user = await User.findById(req.user.id)
  let rating = user.calcRating();

  user = await User.findByIdAndUpdate(req.user.id, { rating: rating })

  res.status(200).redirect('/api/v1/editprofile')
})



// Deleting a achievement
// api/v1/user/editprofile/achievements/:id
exports.deleteAchievement = asyncHandler(async (req, res, next) => {
  id = req.params.id;
  await User.updateOne({ "_id": req.user.id }, { "$pull": { "achievements": { "_id": id } } }, { "multi": true })

  let user = await User.findById(req.user.id)
  let rating = user.calcRating();

  user = await User.findByIdAndUpdate(req.user.id, { rating: rating })

  res.status(200).redirect('/api/v1/editprofile')
})



exports.getHomePage = asyncHandler(async (req, res, next) => {
  res.render('homepage')
})

exports.getlgbtqPage = asyncHandler(async (req, res, next) => {
  res.render('lgbtq')
})

exports.getMentalHealthPage = asyncHandler(async (req, res, next) => {
  res.render('mentalhealth')
})

exports.getCareerPage = asyncHandler(async (req, res, next) => {
  res.render('career')
})

exports.getGREPage = asyncHandler(async (req, res, next) => {
  res.render('career-gre')
})

exports.getMBAPage = asyncHandler(async (req, res, next) => {
  res.render('career-mba')
})

exports.getmtechPage = asyncHandler(async (req, res, next) => {
  res.render('career-mtech')
})

exports.getRoadMap = asyncHandler(async (req, res, next) => {
  res.render('roadmap')
})
