const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.isUser = (req,res,next) =>{
    try {
        if(req.user.role !== "User"){
            return res.status(401).json({
                success:false,
                message:"only Users have access"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"user role is not matching",
        })
    }
    
}

module.exports.isAstrologer = (req,res,next) =>{
    try {
        if(req.user.role !== "Astrologer"){
            return res.status(401).json({
                success:false,
                message:"only Astrologer have access"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"user role is not matching",
        })
    }
    
}

module.exports.isAdmin = (req,res,next) =>{
    try {
        if(req.user.role !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"only Admin have access"
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"user role is not matching",
        })
    }
    
}

module.exports.isAdminOrAstrologer = (req, res, next) => {
    try {
      const userRole = req.user.role;
      if (userRole === "Admin" || userRole === "Astrologer") {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Admins or Astrologers allowed."
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Role verification failed."
      });
    }
  };
  