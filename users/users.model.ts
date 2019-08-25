import * as mongoose from 'mongoose';
import { validateCPF } from '../common/validators';
import * as bcrypt from 'bcrypt';
import { environment } from '../common/environments';

export interface User extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  cpf?: string;
  profiles: string[];
  matches(password: string): boolean;
  hasAny(...profiles: string[]): boolean;
}

export interface UserModel extends mongoose.Model<User> {
  findByEmail(email: string, projection?: string): Promise<User>;
  name: string;
  email: string;
  password: string;
  cpf?: string;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    required: true
  },
  password: {
    type: String,
    select: false,
    required: true
  },
  cpf: {
    type: String,
    required: false,
    minlength: 11,
    maxlength: 11,
    validate: {
      validator: validateCPF,
      //@ts-ignore
      message: props => `CPF ${props.value} inválido!`
    }
  },
  profiles: {
    type: [String],
    required: false
  }
});

userSchema.statics.findByEmail = function(email: string, projection: string) {
  return this.findOne({ email }, projection);
};

userSchema.methods.matches = function(password: string): boolean {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.hasAny = function(...profiles: string[]): boolean {
  return profiles.some(profile => this.profiles.indexOf(profile) !== -1);
};

const hashPassword = (obj, next) => {
  bcrypt
    .hash(obj.password, environment.security.saltRounds)
    .then(hash => {
      obj.password = hash;
      next();
    })
    .catch(next);
};

const saveMiddleware = function(next) {
  const user: User = this;
  if (!user.isModified('password')) {
    next();
  } else {
    hashPassword(user, next);
  }
};

const updateMiddleware = function(next) {
  if (!this.getUpdate().password) {
    next();
  } else {
    hashPassword(this.getUpdate(), next);
  }
};

userSchema.pre('save', saveMiddleware);
userSchema.pre('findOneAndUpdate', updateMiddleware);
userSchema.pre('update', updateMiddleware);

export const User = mongoose.model<User, UserModel>('User', userSchema);
