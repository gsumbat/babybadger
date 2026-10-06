// GENERATED from wireframe P6c-CalMonth.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #FFFFFF; stroke-width: 2.6; stroke-linecap: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>"
];

/** Calendar · Month */
export default function WF_P6c() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 12, paddingTop: 20, paddingRight: 20, paddingBottom: 10, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328", flexShrink: 1 }}>Calendar</Text>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>{/* -> P6-Calendar.dc.html */}
            <SvgXml xml={SVG[0]} width={16} height={16} />
            <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#FFFFFF" }}>Book</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 12 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#4B5960" }}>Day</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6b-CalWeek.dc.html */}
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#4B5960" }}>Week</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38, backgroundColor: "#FFFFFF", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6c-CalMonth.dc.html */}
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#1B2328" }}>Month</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <SvgXml xml={SVG[1]} width={18} height={18} />
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#1B2328", marginVertical: -3.42 }}>October 2026</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>13 shifts booked · [HOURS] hours</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <SvgXml xml={SVG[2]} width={18} height={18} />
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, minHeight: 0, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 10, paddingRight: 8, paddingBottom: 10, paddingLeft: 8, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", gap: 2 }}>
            <View style={{ flexDirection: "row", gap: 2 }}>
              <View style={{ flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>M</Text></View>
              <View style={{ flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>T</Text></View>
              <View style={{ flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>W</Text></View>
              <View style={{ flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>T</Text></View>
              <View style={{ flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>F</Text></View>
              <View style={{ flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>S</Text></View>
              <View style={{ flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>S</Text></View>
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 2 }}>
            <View style={{ flexDirection: "row", gap: 2 }}>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.body, fontSize: 14, color: "#7F8C91" }}>28</Text>
                <View style={{ width: 6, height: 6, marginTop: 4, backgroundColor: "#9AA8AE", borderRadius: 3, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.body, fontSize: 14, color: "#7F8C91" }}>29</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.body, fontSize: 14, color: "#7F8C91" }}>30</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14 }}>1</Text>
                <View style={{ width: 6, height: 6, marginTop: 4, backgroundColor: "#47698A", borderRadius: 3, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>2</Text>
                <View style={{ width: 6, height: 6, marginTop: 4, backgroundColor: "#47698A", borderRadius: 3, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, backgroundColor: "#47698A", borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#FFFFFF" }}>3</Text>
                <View style={{ width: 6, height: 6, marginTop: 4, backgroundColor: "#E8B9BE", borderRadius: 3, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>4</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 2 }}>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>5</Text>
                <View style={{ width: 6, height: 6, marginTop: 4, backgroundColor: "#47698A", borderRadius: 3, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>6</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>7</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>8</Text>
                <View style={{ width: 6, height: 6, marginTop: 4, backgroundColor: "#47698A", borderRadius: 3, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>9</Text>
                <View style={{ width: 6, height: 6, marginTop: 4, backgroundColor: "#47698A", borderRadius: 3, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>10</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>11</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 2 }}>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>12</Text>
                <View style={{ width: 6, height: 6, marginTop: 4, backgroundColor: "#47698A", borderRadius: 3, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>13</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>14</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>15</Text>
                <View style={{ width: 6, height: 6, marginTop: 4, backgroundColor: "#47698A", borderRadius: 3, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>16</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>17</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>18</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 2 }}>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>19</Text>
                <View style={{ width: 6, height: 6, marginTop: 4, backgroundColor: "#47698A", borderRadius: 3, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>20</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>21</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>22</Text>
                <View style={{ width: 6, height: 6, marginTop: 4, backgroundColor: "#47698A", borderRadius: 3, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>23</Text>
                <View style={{ width: 6, height: 6, marginTop: 4, backgroundColor: "#47698A", borderRadius: 3, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>24</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>25</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 2 }}>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>26</Text>
                <View style={{ width: 6, height: 6, marginTop: 4, backgroundColor: "#47698A", borderRadius: 3, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>27</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>28</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>29</Text>
                <View style={{ width: 6, height: 6, marginTop: 4, backgroundColor: "#47698A", borderRadius: 3, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>30</Text>
                <View style={{ width: 6, height: 6, marginTop: 4, backgroundColor: "#47698A", borderRadius: 3, flexDirection: "column" }}>
                </View>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
                <Text style={{ fontFamily: font.body, fontSize: 14 }}>31</Text>
              </View>
              <View style={{ flexDirection: "column", alignItems: "center", height: 52, paddingTop: 6, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
                <Text style={{ fontFamily: font.body, fontSize: 14, color: "#7F8C91" }}>1</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <View style={{ width: 8, height: 8, backgroundColor: "#47698A", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Booked</Text>
          </View>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <View style={{ width: 8, height: 8, backgroundColor: "#B7791F", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Waiting</Text>
          </View>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <View style={{ width: 14, height: 10, borderRadius: 3, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Maya away</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10, paddingRight: 14, paddingBottom: 10, paddingLeft: 14, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Sat, Oct 3</Text>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Maya · 6:00 – 7:00 PM</Text>
          </View>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 24, paddingTop: 0, paddingRight: 8, paddingBottom: 0, paddingLeft: 8, backgroundColor: "#F6E3C6", borderRadius: 999, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#7A4E0E" }}>Waiting</Text>
          </View>
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
