const { Organization, User, Cause, Transaction } = require('../models');

exports.getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.findAll({
      attributes: ['id', 'name', 'description', 'website', 'status']
    });

    res.json({ organizations });
  } catch (error) {
    console.error('Get all organizations error:', error);
    res.status(500).json({ message: 'Error fetching organizations', error: error.message });
  }
};

exports.getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'role']
        }
      ]
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({ organization });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ message: 'Error fetching organization', error: error.message });
  }
};

exports.createOrganization = async (req, res) => {
  try {
    const { name, description, website } = req.body;

    // Verificar si ya existe una organización con el mismo nombre
    const existingOrg = await Organization.findOne({ where: { name } });
    if (existingOrg) {
      return res.status(400).json({ message: 'Organization name already exists' });
    }

    const organization = await Organization.create({
      name,
      description,
      website,
      status: 'pending'
    });

    // Agregar al creador como miembro
    await User.update(
      { organizationId: organization.id },
      { where: { id: req.user.id } }
    );

    res.status(201).json({
      message: 'Organization created successfully',
      organization
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ message: 'Error creating organization', error: error.message });
  }
};

exports.updateOrganization = async (req, res) => {
  try {
    const { name, description, website, settings } = req.body;
    const organization = await Organization.findByPk(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Verificar si el usuario tiene permiso
    const user = await User.findByPk(req.user.id);
    if (user.organizationId !== organization.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update this organization' });
    }

    // Verificar si el nuevo nombre ya existe
    if (name && name !== organization.name) {
      const existingOrg = await Organization.findOne({ where: { name } });
      if (existingOrg) {
        return res.status(400).json({ message: 'Organization name already exists' });
      }
    }

    await organization.update({
      name: name || organization.name,
      description: description || organization.description,
      website: website || organization.website,
      settings: settings ? { ...organization.settings, ...settings } : organization.settings
    });

    res.json({
      message: 'Organization updated successfully',
      organization
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ message: 'Error updating organization', error: error.message });
  }
};

exports.deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Verificar si el usuario tiene permiso
    const user = await User.findByPk(req.user.id);
    if (user.organizationId !== organization.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this organization' });
    }

    await organization.destroy();

    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({ message: 'Error deleting organization', error: error.message });
  }
};

exports.getOrganizationCauses = async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id, {
      include: [
        {
          model: Cause,
          attributes: ['id', 'title', 'description', 'goalAmount', 'currentAmount', 'status']
        }
      ]
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({ causes: organization.Causes });
  } catch (error) {
    console.error('Get organization causes error:', error);
    res.status(500).json({ message: 'Error fetching organization causes', error: error.message });
  }
};

exports.getOrganizationMembers = async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({ members: organization.Users });
  } catch (error) {
    console.error('Get organization members error:', error);
    res.status(500).json({ message: 'Error fetching organization members', error: error.message });
  }
};

exports.addOrganizationMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const organization = await Organization.findByPk(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Verificar si el usuario tiene permiso
    const currentUser = await User.findByPk(req.user.id);
    if (currentUser.organizationId !== organization.id && currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to add members to this organization' });
    }

    // Verificar si el usuario a agregar existe
    const userToAdd = await User.findByPk(userId);
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verificar si el usuario ya es miembro
    if (userToAdd.organizationId === organization.id) {
      return res.status(400).json({ message: 'User is already a member of this organization' });
    }

    await userToAdd.update({ organizationId: organization.id });

    res.json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('Add organization member error:', error);
    res.status(500).json({ message: 'Error adding organization member', error: error.message });
  }
};

exports.removeOrganizationMember = async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Verificar si el usuario tiene permiso
    const currentUser = await User.findByPk(req.user.id);
    if (currentUser.organizationId !== organization.id && currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to remove members from this organization' });
    }

    // Verificar si el usuario a remover existe y es miembro
    const userToRemove = await User.findByPk(req.params.userId);
    if (!userToRemove || userToRemove.organizationId !== organization.id) {
      return res.status(404).json({ message: 'Member not found in this organization' });
    }

    await userToRemove.update({ organizationId: null });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove organization member error:', error);
    res.status(500).json({ message: 'Error removing organization member', error: error.message });
  }
};

exports.updateOrganizationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const organization = await Organization.findByPk(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    await organization.update({ status });

    res.json({
      message: 'Organization status updated successfully',
      organization
    });
  } catch (error) {
    console.error('Update organization status error:', error);
    res.status(500).json({ message: 'Error updating organization status', error: error.message });
  }
};

exports.getOrganizationTransactions = async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id, {
      include: [
        {
          model: User,
          include: [
            {
              model: Transaction,
              attributes: ['id', 'amount', 'type', 'status', 'createdAt']
            }
          ]
        }
      ]
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Aplanar las transacciones de todos los usuarios
    const transactions = organization.Users.reduce((acc, user) => {
      return acc.concat(user.Transactions);
    }, []);

    res.json({ transactions });
  } catch (error) {
    console.error('Get organization transactions error:', error);
    res.status(500).json({ message: 'Error fetching organization transactions', error: error.message });
  }
};
