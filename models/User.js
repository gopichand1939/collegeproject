const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: [true, 'Please Add First Name'],
        trim: true
    },

    lastName: {
        type: String,
        required: [true, 'Please Add Last Name'],
        trim: true
    },

    email: {
        type: String,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please Add A valid Email'],
        unique: true
    },

    gender: {
        type: String,
        required: [true, 'Please Enter Gender'],

    },
    password: {
        type: String,
        required: [true, 'Please Enter Password'],
        select: false
    },

    age: {
        type: Number,
        required: [true, 'Please add your Age']
    },

    matriculation: {
        schoolName: String,
        totalPercentage: Number
    },

    intermediate: {
        schoolName: String,
        totalPercentage: Number
    },

    graduation: [
        {
            collegeName: String,
            sem: Number,
            cgpa: Number
        }
    ],

    skills: [
        {
            title: String,
            link: String,
        }
    ],

    achievements: [{
        title: String,
        description: String,
    }],

    rating: {
        type: Number,
    },

    photo: {
        type: String,
        default: 'no-image.jpg'
    },

    bio: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});




//Password Hashing
UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})


//Get Signed Token from JWT
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

//Matching Password
UserSchema.methods.checkPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}


UserSchema.methods.calcRating = function () {

    let matricRating = 0;
    let intermediateRating = 0;
    let graduationRating = 0;
    let skillRating = 0;
    let achievementRating = 0;


    //Matric Rating
    if (this.matriculation !== undefined) {
        matricRating = getMatricRating(this.matriculation.totalPercentage);
        if (matricRating === undefined) {
            matricRating = 0;
        }
    }



    //Rating Based on 12th marks
    if (this.intermediate !== undefined) {
        intermediateRating = getInterRating(this.intermediate.totalPercentage)
        if (intermediateRating === undefined) {
            intermediateRating = 0;
        }
    }

    //Rating Based upon Graduation
    if (this.graduation !== undefined) {
        graduationRating = getGraduationRating(this.graduation)
        if (graduationRating === undefined) {
            graduationRating = 0;
        }

    }

    //Rating Based upon Skills
    if (this.skills !== undefined) {
        skillRating = getSkillRating(this.skills)
        if (skillRating === undefined) {
            skillRating = 0;
        }
    }

    //Rating Based Upon User's Responsibilty 
    if (this.achievements !== undefined) {
        achievementRating = getResRating(this.achievements)
        if (skillRating === undefined) {
            skillRating = 0;
        }
    }

    let rating = parseFloat(matricRating + intermediateRating + graduationRating + skillRating + achievementRating).toFixed(1);
    return rating

}

const getMatricRating = function (totalPercentage) {

    //Rating Based on 10th marks
    if (totalPercentage > 90) {
        return 0.5
    }

    else if (totalPercentage >= 80) {
        return 0.4
    }

    else if (totalPercentage >= 65) {
        return 0.3
    }


    else if (totalPercentage >= 50) {
        return 0.4
    }

    else if (totalPercentage < 50 && totalPercentage > 0) {
        return 0.1
    }

}

const getInterRating = function (totalPercentage) {
    if (totalPercentage > 85) {
        return 0.5
    }

    else if (totalPercentage >= 75) {
        return 0.4
    }

    else if (totalPercentage >= 70) {
        return 0.3
    }


    else if (totalPercentage >= 60) {
        return 0.4
    }

    else if (totalPercentage < 60 && totalPercentage > 0) {
        return 0.1
    }

    else {
        return 0;
    }

}

const getGraduationRating = function (graduation) {

    let totalSemGPA = 0;
    let totalSem = graduation.length;
    let averageSem;

    graduation.forEach(semester => {
        totalSemGPA = totalSemGPA + semester.cgpa;
    })

    averageSem = totalSemGPA / totalSem;

    if (averageSem >= 9.5) {
        return 1;
    }

    else if (averageSem >= 9) {
        return 0.9;
    }

    else if (averageSem >= 8.5) {
        return 0.8;
    }

    else if (averageSem >= 7.5) {
        return 0.7;
    }

    else if (averageSem >= 6) {
        return 0.6;
    }

    else if (averageSem < 6 && averageSem > 0) {
        return 0.5;
    }
    else {
        return 0;
    }
}



const getSkillRating = function (skills) {

    if (skills.length >= 5) {
        return 1.5
    }

    else {
        return (0.3 * skills.length)
    }

}

const getResRating = function (responsibility) {
    if (responsibility.length >= 5) {
        return 1.5
    }

    else {
        return (0.3 * responsibility.length)
    }
}

module.exports = mongoose.model('User', UserSchema);