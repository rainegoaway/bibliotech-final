import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    console.log(`Bar code with type ${type} and data ${data} has been scanned!`);

    const bookIdMatch = data.match(/\/student\/book-view\/(\d+)/);

    if (bookIdMatch && bookIdMatch[1]) {
      const bookId = bookIdMatch[1];
      Alert.alert(
        'QR Code Scanned',
        `Book ID: ${bookId}\nNavigating to book details...`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace(`/student/book-view/${bookId}` as any);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Invalid QR Code',
        'This QR code does not contain a valid book link. Please try again.',
        [
          {
            text: 'Scan Again',
            onPress: () => setScanned(false),
          },
        ]
      );
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting for camera permission</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <Button title={'Grant Permission'} onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Book QR</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.scannerContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
        {scanned && (
          <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    zIndex: 1, // Ensure header is above scanner
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scannerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
  },
});
