import { Dimensions, Image, StyleSheet, View } from "react-native";

export const receiptImageWidth = () => Math.round(Dimensions.get("window").width - 40);

export const receiptFromPickerAsset = (asset) => {
  if (asset?.base64) return `data:image/jpeg;base64,${asset.base64}`;
  return asset?.uri || "";
};

export const ReceiptImage = ({ uri, height = 220 }) => {
  if (!uri) return null;
  const width = receiptImageWidth();
  const pad = 10;
  return (
    <View style={[styles.frame, { width, height }]}>
      <Image
        source={{ uri }}
        style={{ width: width - pad * 2, height: height - pad * 2 }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    backgroundColor: "#334155",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
});
