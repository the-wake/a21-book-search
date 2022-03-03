const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    user: async (_, { username }) => {
      // How do we get this to search by either id or username?
      const user = await User.findOne({ username })
      if (!user) {
        // Throw should function as a return and terminate the function.
        throw new AuthenticationError('No user found.');
      }
      return user;
    }
  },
  Mutation: {
    createUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (_, { email, password }) => {
      // Again, doing the username || email thing.
      const user = await User.findOne({ username });
      const correctPw = await user.isCorrectPassword(password);

      if (!user || !correctPw) {
        throw new AuthenticationError('No user found for those credentials.')
      }

      const token = signToken(user);
      return { token, user };

    },
    saveBook: async (_, { newBook }, context) => {
      console.log(context.user);
      if (context.user) {
        const modUser = User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: newBook } },
          { new: true, runValidators: true },
        );

        if (!modUser) {
          throw new AuthenticationError('User not found.');
        }

        return modUser;
      }
      
      throw new AuthenticationError('You must be logged in.');
    },
    removeBook: async (_, { deletedBook }, context) => {
      console.log(context.user);
      if (context.user) {
        const modUser = User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: deletedBook } },
          { new: true, runValidators: true },
        );
  
        if (!modUser) {
          throw new AuthenticationError('User not found.');
        }
  
        return modUser;
      }

      throw new AuthenticationError('You must be logged in.');
    }
  }
}

module.exports = resolvers;
