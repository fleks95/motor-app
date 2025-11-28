import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      console.log('Logout successful, redirecting...');
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Redirect to login if user is null
  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to motoR!</Text>
      <Text style={styles.subtitle}>Hello, {user?.full_name || 'Rider'}!</Text>
      
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>🏍️</Text>
        <Text style={styles.placeholderSubtext}>
          Your motorcycle routes will appear here
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 72,
    marginBottom: 16,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  logoutButton: {
    height: 50,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
