<template>
  <div
    @click="checkClick"
    ref="invoiceWrap"
    class="invoice-wrap flex flex-column"
  >
    <form @submit.prevent="submitForm" class="invoice-content">
      <Loading v-show="loading" />
      <h1 v-if="!editInvoice">New Invoice</h1>
      <h1 v-else>Edit Invoice</h1>

      <!-- Bill From -->
      <div class="bill-from flex flex-column">
        <h4>Bill From</h4>
        <div class="input flex flex-column">
          <label for="billerStreetAddress">Street Address</label>
          <input
            required
            type="text"
            id="billerStreetAddress"
            v-model="billerStreetAddress"
          />
        </div>
        <div class="location-details flex">
          <div class="input flex flex-column">
            <label for="billerCity">City</label>
            <input required type="text" id="billerCity" v-model="billerCity" />
          </div>
          <div class="input flex flex-column">
            <label for="billerZipCode">Zip Code</label>
            <input
              required
              type="text"
              id="billerZipCode"
              v-model="billerZipCode"
            />
          </div>
          <div class="input flex flex-column">
            <label for="billerCountry">Country</label>
            <input
              required
              type="text"
              id="billerCountry"
              v-model="billerCountry"
            />
          </div>
        </div>
      </div>

      <!-- Bill To -->
      <div class="bill-to flex flex-column">
        <h4>Bill To</h4>
        <div class="input flex flex-column">
          <label for="clientName">Client's Name</label>
          <input required type="text" id="clientName" v-model="clientName" />
        </div>
        <div class="input flex flex-column">
          <label for="clientEmail">Client's Email</label>
          <input required type="text" id="clientEmail" v-model="clientEmail" />
        </div>
        <div class="input flex flex-column">
          <label for="clientStreetAddress">Street Address</label>
          <input
            required
            type="text"
            id="clientStreetAddress"
            v-model="clientStreetAddress"
          />
        </div>
        <div class="location-details flex">
          <div class="input flex flex-column">
            <label for="clientCity">City</label>
            <input required type="text" id="clientCity" v-model="clientCity" />
          </div>
          <div class="input flex flex-column">
            <label for="clientZipCode">Zip Code</label>
            <input
              required
              type="text"
              id="clientZipCode"
              v-model="clientZipCode"
            />
          </div>
          <div class="input flex flex-column">
            <label for="clientCountry">Country</label>
            <input
              required
              type="text"
              id="clientCountry"
              v-model="clientCountry"
            />
          </div>
        </div>
      </div>

      <!-- Invoice Work Details -->
      <div class="invoice-work flex flex-column">
        <div class="payment flex">
          <div class="input flex flex-column">
            <label for="invoiceDate">Invoice Date</label>
            <input
              disabled
              type="text"
              id="invoiceDate"
              v-model="invoiceDate"
            />
          </div>
          <div class="input flex flex-column">
            <label for="paymentDueDate">Payment Due</label>
            <input
              disabled
              type="text"
              id="paymentDueDate"
              v-model="paymentDueDate"
            />
          </div>
        </div>
        <div class="input flex flex-column">
          <label for="paymentTerms">Payment Terms</label>
          <select required id="paymentTerms" v-model="paymentTerms">
            <option value="30">Net 30 Days</option>
            <option value="60">Net 60 Days</option>
          </select>
        </div>
        <div class="input flex flex-column">
          <label for="productDescription">Product Description</label>
          <input
            required
            type="text"
            id="productDescription"
            v-model="productDescription"
          />
        </div>
        <div class="work-items">
          <h3>Item List</h3>
          <table class="item-list">
            <tr class="table-heading flex">
              <th class="item-name">Item Name</th>
              <th class="qty">Qty</th>
              <th class="price">Price</th>
              <th class="total">Toal</th>
            </tr>
            <tr
              class="table-items flex"
              v-for="(item, index) in invoiceItemList"
              :key="index"
            >
              <td class="item-name">
                <input type="text" v-model="item.itemName" />
              </td>
              <td class="qty"><input type="text" v-model="item.qty" /></td>
              <td class="price"><input type="text" v-model="item.price" /></td>
              <td class="total flex">
                ${{ (item.total = item.qty * item.price) }}
              </td>
              <img
                @click="deleteInvoiceItem(item.id)"
                src="@/assets/icon-delete.svg"
                alt=""
              />
            </tr>
          </table>

          <div @click="addNewInvoiceItem" class="flex button">
            <img src="@/assets/icon-plus.svg" alt="" />
            Add New Item
          </div>
        </div>
      </div>

      <!-- Save/Exit -->
      <div class="save flex">
        <div class="left">
          <button type="button" @click="closeInvoice" class="red">
            Cancel
          </button>
        </div>
        <div class="right flex">
          <button
            v-if="!editInvoice"
            type="submit"
            @click="saveDraft"
            class="dark-purple"
          >
            Save Draft
          </button>
          <button
            v-if="!editInvoice"
            type="submit"
            @click="publishInvoice"
            class="purple"
          >
            Create Invoice
          </button>
          <button v-if="editInvoice" type="sumbit" class="purple">
            Update Invoice
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import db from "../firebase/firebaseInit";
import Loading from "../components/Loading.vue";
import { ref, reactive, watch } from "vue";
import { useMutations, useState, useActions } from "@/helpers";
import { uid } from "uid";
import { useRoute } from "vue-router";
export default {
  name: "invoiceModal",
  components: {
    Loading,
  },
  setup() {
    const docId = ref();
    const billerStreetAddress = ref();
    const billerCity = ref();
    const billerZipCode = ref();
    const billerCountry = ref();
    const clientName = ref();
    const clientEmail = ref();
    const clientStreetAddress = ref();
    const clientCity = ref();
    const clientZipCode = ref();
    const clientCountry = ref();
    const invoiceDateUnix = ref();
    const invoiceDate = ref();
    const paymentTerms = ref();
    const paymentDueDateUnix = ref();
    const paymentDueDate = ref();
    const productDescription = ref();
    const invoicePending = ref(false);
    const invoiceDraft = ref(false);
    const invoiceItemList = ref([]);
    const invoiceTotal = ref(0);
    const loading = ref(false);
    const invoiceWrap = ref(null);
    const dateOptions = reactive({
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const { editInvoice, currentInvoiceArray } = useState([
      "editInvoice",
      "currentInvoiceArray",
    ]);

    const { toggle_invoice, toggle_modal, toggle_edit_invoice } = useMutations([
      "toggle_invoice",
      "toggle_modal",
      "toggle_edit_invoice",
    ]);

    const { update_invoice, get_invoices } = useActions([
      "update_invoice",
      "get_invoices",
    ]);
    const route = useRoute();

    const checkClick = function(e) {
      if (e.target === invoiceWrap.value) {
        toggle_modal();
      }
    };

    const closeInvoice = () => {
      toggle_invoice();
      if (editInvoice.value) toggle_edit_invoice();
    };

    if (!editInvoice.value) {
      invoiceDateUnix.value = Date.now();
      invoiceDate.value = new Date(invoiceDateUnix.value).toLocaleDateString(
        "en-gb",
        dateOptions
      );
    }

    if (editInvoice.value) {
      const currentInvoice = currentInvoiceArray.value[0];
      docId.value = currentInvoice.docId;
      billerStreetAddress.value = currentInvoice.billerStreetAddress;
      billerCity.value = currentInvoice.billerCity;
      billerZipCode.value = currentInvoice.billerZipCode;
      billerCountry.value = currentInvoice.billerCountry;
      clientName.value = currentInvoice.clientName;
      clientEmail.value = currentInvoice.clientEmail;
      clientStreetAddress.value = currentInvoice.clientStreetAddress;
      clientCity.value = currentInvoice.clientCity;
      clientZipCode.value = currentInvoice.clientZipCode;
      clientCountry.value = currentInvoice.clientCountry;
      invoiceDateUnix.value = currentInvoice.invoiceDateUnix;
      invoiceDate.value = currentInvoice.invoiceDate;
      paymentTerms.value = currentInvoice.paymentTerms;
      paymentDueDateUnix.value = currentInvoice.paymentDueDateUnix;
      paymentDueDate.value = currentInvoice.paymentDueDate;
      productDescription.value = currentInvoice.productDescription;
      invoicePending.value = currentInvoice.invoicePending;
      invoiceDraft.value = currentInvoice.invoiceDraft;
      invoiceItemList.value = currentInvoice.invoiceItemList;
      invoiceTotal.value = currentInvoice.invoiceTotal;
    }

    const addNewInvoiceItem = function() {
      invoiceItemList.value.push({
        id: uid(),
        itemName: "",
        qty: "",
        price: 0,
        total: 0,
      });
    };

    const deleteInvoiceItem = function(id) {
      invoiceItemList.value = invoiceItemList.value.filter(
        (item) => item.id !== id
      );
    };

    const calInvoiceTotal = function() {
      invoiceTotal.value = 0;
      invoiceItemList.value.forEach(
        (item) => (invoiceTotal.value += item.total)
      );
    };

    const publishInvoice = function() {
      invoicePending.value = true;
    };

    const saveDraft = function() {
      invoiceDraft.value = true;
    };

    const uploadInvoice = async function() {
      if (invoiceItemList.value.length <= 0) {
        return alert("Please ensure you filled out work items!");
      }
      loading.value = true;

      calInvoiceTotal();

      const dataBase = db.collection("invoices").doc();

      await dataBase.set({
        invoiceId: uid(6),
        billerStreetAddress: billerStreetAddress.value,
        billerCity: billerCity.value,
        billerZipCode: billerZipCode.value,
        billerCountry: billerCountry.value,
        clientName: clientName.value,
        clientEmail: clientEmail.value,
        clientStreetAddress: clientStreetAddress.value,
        clientCity: clientCity.value,
        clientZipCode: clientZipCode.value,
        clientCountry: clientCountry.value,
        invoiceDateUnix: invoiceDateUnix.value,
        invoiceDate: invoiceDate.value,
        paymentTerms: paymentTerms.value,
        paymentDueDateUnix: paymentDueDateUnix.value,
        paymentDueDate: paymentDueDate.value,
        productDescription: productDescription.value,
        invoicePending: invoicePending.value,
        invoiceDraft: invoiceDraft.value,
        invoiceItemList: invoiceItemList.value,
        invoiceTotal: invoiceTotal.value,
      });
      loading.value = false;
      toggle_invoice();
      get_invoices();
    };

    const updateInvoice = async function() {
      if (invoiceItemList.value.length <= 0) {
        return alert("Please ensure you filled out work items!");
      }
      loading.value = true;

      calInvoiceTotal();

      const dataBase = db.collection("invoices").doc(docId.value);

      await dataBase.update({
        billerStreetAddress: billerStreetAddress.value,
        billerCity: billerCity.value,
        billerZipCode: billerZipCode.value,
        billerCountry: billerCountry.value,
        clientName: clientName.value,
        clientEmail: clientEmail.value,
        clientStreetAddress: clientStreetAddress.value,
        clientCity: clientCity.value,
        clientZipCode: clientZipCode.value,
        clientCountry: clientCountry.value,
        paymentTerms: paymentTerms.value,
        paymentDueDateUnix: paymentDueDateUnix.value,
        paymentDueDate: paymentDueDate.value,
        productDescription: productDescription.value,
        invoiceItemList: invoiceItemList.value,
        invoiceTotal: invoiceTotal.value,
      });
      loading.value = false;

      const data = {
        docId: docId.value,
        routeId: route.params.invoiceId,
      };

      update_invoice(data);
    };

    const submitForm = function() {
      if (editInvoice.value) updateInvoice();
      else uploadInvoice();
    };

    const setPaymentDueDate = function() {
      const futureDate = new Date();
      paymentDueDateUnix.value = futureDate.setDate(
        futureDate.getDate() + parseInt(paymentTerms.value)
      );
      paymentDueDate.value = new Date(
        paymentDueDateUnix.value
      ).toLocaleDateString("en-gb", dateOptions);
    };

    watch(paymentTerms, setPaymentDueDate);

    return {
      docId,
      billerStreetAddress,
      billerCity,
      billerZipCode,
      billerCountry,
      clientName,
      clientEmail,
      clientStreetAddress,
      clientCity,
      clientZipCode,
      clientCountry,
      invoiceDateUnix,
      invoiceDate,
      paymentTerms,
      paymentDueDateUnix,
      paymentDueDate,
      productDescription,
      invoicePending,
      invoiceDraft,
      invoiceItemList,
      invoiceTotal,
      invoiceWrap,
      loading,
      dateOptions,
      closeInvoice,
      addNewInvoiceItem,
      deleteInvoiceItem,
      publishInvoice,
      saveDraft,
      submitForm,
      checkClick,
      editInvoice,
    };
  },
};
</script>

<style lang="scss" scoped>
.invoice-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: scroll;
  z-index: 1;
  &::-webkit-scrollbar {
    display: none;
  }
  @media (min-width: 900px) {
    left: 90px;
  }
  .invoice-content {
    position: relative;
    padding: 56px;
    max-width: 700px;
    width: 100%;
    background-color: #141625;
    color: #fff;
    box-shadow: 10px 4px 6px -1px rgba(0, 0, 0, 0.2),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    h1 {
      margin-bottom: 48px;
      color: #fff;
    }
    h3 {
      margin-bottom: 16px;
      font-size: 18px;
      color: #777f98;
    }
    h4 {
      color: #7c5dfa;
      font-size: 12px;
      margin-bottom: 24px;
    }
    // Bill To / Bill From
    .bill-to,
    .bill-from {
      margin-bottom: 48px;
      .location-details {
        gap: 16px;
        div {
          flex: 1;
        }
      }
    }
    // Invoice Work
    .invoice-work {
      .payment {
        gap: 24px;
        div {
          flex: 1;
        }
      }
      .work-items {
        .item-list {
          width: 100%;
          // Item Table Styling
          .table-heading,
          .table-items {
            gap: 16px;
            font-size: 12px;
            .item-name {
              flex-basis: 50%;
            }
            .qty {
              flex-basis: 10%;
            }
            .price {
              flex-basis: 20%;
            }
            .total {
              flex-basis: 20%;
              align-self: center;
            }
          }
          .table-heading {
            margin-bottom: 16px;
            th {
              text-align: left;
            }
          }
          .table-items {
            position: relative;
            margin-bottom: 24px;
            img {
              position: absolute;
              top: 15px;
              right: 0;
              width: 12px;
              height: 16px;
            }
          }
        }
        .button {
          color: #fff;
          background-color: #252945;
          align-items: center;
          justify-content: center;
          width: 100%;
          img {
            margin-right: 4px;
          }
        }
      }
    }
    .save {
      margin-top: 60px;
      div {
        flex: 1;
      }
      .right {
        justify-content: flex-end;
      }
    }
  }
  .input {
    margin-bottom: 24px;
  }
  label {
    font-size: 12px;
    margin-bottom: 6px;
  }
  input,
  select {
    width: 100%;
    background-color: #1e2139;
    color: #fff;
    border-radius: 4px;
    padding: 12px 4px;
    border: none;
    &:focus {
      outline: none;
    }
  }
}
</style>
