export const mapBackendRoleToCanonical = (role) => {
  if (!role) return null;
  const r = role.toString().toLowerCase();
  switch (r) {
    case 'waste_generator':
      return 'generator';
    case 'buyer':
      return 'recycler';
    case 'delivery':
      return 'delivery';
    case 'admin':
      return 'admin';
    // Accept legacy frontend names too
    case 'generator':
    case 'recycler':
      return r;
    default:
      return r;
  }
};
