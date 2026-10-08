// GENERATED from wireframe P12b-SettingsAccount.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  
];

/** Parent settings · account */
export default function WF_P12b() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ paddingTop: 20, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}><Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}><Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328" }}>Settings</Text></Text></View>
      <View style={{ flexDirection: "column", gap: 8, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>FAMILY</Text>
        <View style={{ flexDirection: "column", paddingTop: 4, paddingRight: 16, paddingBottom: 4, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 52, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> P78-FamilyMembers.dc.html */}
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Family members</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Jen, Sam · 2 of 4 seats ›</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 52, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> P13-KidsDevices.dc.html */}
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Kids and devices</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Ava, Leo ›</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 52, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> P27-Sitters.dc.html */}
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Sitters</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Maya ›</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 52, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> P56-Places.dc.html */}
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Homes and places</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>2 homes, 3 places ›</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 52 }}>{/* -> P74-HouseRules.dc.html */}
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>House rules</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>10 rules ›</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 2 }}>ALERTS</Text>
        <View style={{ flexDirection: "column", paddingTop: 4, paddingRight: 16, paddingBottom: 4, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 56, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328" }}>Arrivals and departures</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74" }}>Trips to saved places</Text>
            </View>
            <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 15, flexDirection: "column" }}>
              <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#47698A", backgroundColor: "#47698A", alignItems: "center", justifyContent: "center" }}><SvgXml xml={CHECK} width={16} height={16} /></View>
              <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 56, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328" }}>Food and tasks</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74" }}>Each entry the sitter logs</Text>
            </View>
            <View style={{ width: 50, height: 30, flexShrink: 0, backgroundColor: "#C3CCD5", borderRadius: 15, flexDirection: "column" }}>
              <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#C3CCD5", backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }}></View>
              <View style={{ width: 24, height: 24, top: 3, left: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 56 }}>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328" }}>Off-plan and help alerts</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74" }}>Always on for safety</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", height: 26, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Always</Text>
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 2 }}>PRIVACY</Text>
        <View style={{ flexDirection: "column", paddingTop: 4, paddingRight: 16, paddingBottom: 4, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 52, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Consent records</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>1 signed</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 52, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Keep location history</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>[RETENTION]</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 52 }}>{/* -> P39-Subscription.dc.html */}
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Subscription</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Family · monthly ›</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6, marginTop: 2 }}>ACCOUNT</Text>
        <View style={{ flexDirection: "column", paddingTop: 4, paddingRight: 16, paddingBottom: 4, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 52, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Name</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>Jen Lee</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 52, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> P12p-PhoneSheet.dc.html */}
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Phone</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>(813) 555-0142 ›</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 52 }}>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Email</Text>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>jen@example.com</Text>
          </View>
        </View>
        <View style={{ height: 54, marginTop: 8, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.5, borderColor: "#C3CCD5", justifyContent: "center" }}><Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#A1321F" }}>Sign out</Text></View>
        <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", textAlign: "center" }}>Alerts to this phone stop until you sign in again.</Text>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
