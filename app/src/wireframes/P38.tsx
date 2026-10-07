// GENERATED from wireframe P38-TrialStarted.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Image } from 'expo-image';
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  
];

/** Trial started */
export default function WF_P38() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 16, flexGrow: 1, paddingTop: 64, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Image source={require('@/assets/images/badger-celebrate.png')} style={{ flexShrink: 0, width: 171, height: 170 }} contentFit="contain" />
          <Text style={{ fontFamily: font.display, fontSize: 28, color: "#1B2328", marginVertical: -5.43, textAlign: "center" }}>Your free trial is on</Text>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22, textAlign: "center" }}>Everything is unlocked until <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", lineHeight: 22, textAlign: "center" }}>Fri, Nov 6</Text>.</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", height: 10, backgroundColor: "#E8ECF1", borderRadius: 5, overflow: "hidden", flexShrink: 1, minHeight: 0 }}>
            <View style={{ width: "8%", backgroundColor: "#47698A", flexShrink: 1, flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", flexShrink: 1 }}>Today</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", flexShrink: 1 }}>Reminder Nov 3</Text>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", flexShrink: 1 }}>First charge Nov 6</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Remind me before it ends</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Push, 3 days before</Text>
          </View>
          <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 15, flexDirection: "column" }}>
            <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
            </View>
          </View>
        </View>
        <View style={{ paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 14 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#1B2328", lineHeight: 20 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#34526E", lineHeight: 20 }}>Sam is covered too.</Text> One plan for your household. Invite him in Settings › Parents.</Text></View>
        <View style={{ flexGrow: 1, flexDirection: "column" }}>
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, flexGrow: 1, flexBasis: 0, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P4a-HomeNew.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Continue setup</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
