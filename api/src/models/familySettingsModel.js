import mongoose from 'mongoose';

const familySettingsSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    preferences: {
      groceryStores: {
        type: [String],
        default: [],
        validate: {
          validator: function (stores) {
            return stores.length <= 10;
          },
          message: 'Maximum 10 grocery stores allowed',
        },
      },
      schools: {
        type: [
          {
            name: { type: String, required: true },
            pickupTime: String,
            location: String,
          },
        ],
        default: [],
        validate: {
          validator: function (schools) {
            return schools.length <= 5;
          },
          message: 'Maximum 5 schools allowed',
        },
      },
      neighborhood: {
        type: String,
        default: '',
        maxlength: 200,
      },
      zipCode: {
        type: String,
        default: '',
        maxlength: 10,
      },
      routines: {
        groceryShopping: {
          type: String,
          default: '',
          maxlength: 200,
        },
        schoolPickup: {
          type: String,
          default: '',
          maxlength: 200,
        },
        other: {
          type: String,
          default: '',
          maxlength: 500,
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

// Instance method to get formatted context for AI
familySettingsSchema.methods.getAIContext = function () {
  const context = [];

  if (this.preferences.neighborhood) {
    context.push(`Location: ${this.preferences.neighborhood}`);
  }

  if (this.preferences.zipCode) {
    context.push(`Zip Code: ${this.preferences.zipCode}`);
  }

  if (this.preferences.groceryStores?.length > 0) {
    context.push(`Preferred stores: ${this.preferences.groceryStores.join(', ')}`);
  }

  if (this.preferences.schools?.length > 0) {
    const schoolInfo = this.preferences.schools
      .map((s) => {
        const parts = [s.name];
        if (s.pickupTime) {
          parts.push(`pickup at ${s.pickupTime}`);
        }
        if (s.location) {
          parts.push(`(${s.location})`);
        }
        return parts.join(' ');
      })
      .join('; ');
    context.push(`Schools: ${schoolInfo}`);
  }

  if (this.preferences.routines?.groceryShopping) {
    context.push(`Shopping routine: ${this.preferences.routines.groceryShopping}`);
  }

  if (this.preferences.routines?.schoolPickup) {
    context.push(`School pickup routine: ${this.preferences.routines.schoolPickup}`);
  }

  if (this.preferences.routines?.other) {
    context.push(`Other notes: ${this.preferences.routines.other}`);
  }

  return context.join('\n');
};

const FamilySettings = mongoose.model('FamilySettings', familySettingsSchema);

export default FamilySettings;
