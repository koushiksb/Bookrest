exports.isLoggedIn = function (req, res, next) {

                            if (req.isAuthenticated()){
                                return next();
                                  console.log('sdfgsd');
                                }
                            else{
                              console.log('sd');
                              return res.redirect('/users/login');

                            }
                          }
