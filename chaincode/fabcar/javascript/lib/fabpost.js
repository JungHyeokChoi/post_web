/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FabUser extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const users = [
            {
                username: 'Kim',
                email: '1@naver.com',
                phone: '010-1111-1111',
                words: 'Hello Kim'
            },
            {
                username: 'Nam',
                email: '2@naver.com',
                phone: '010-2222-2222',
                words: 'Hello Nam'
            },
            {
                username: 'Choi',
                email: '3@naver.com',
                phone: '010-3333-3333',
                words: 'Hello Choi'
            },
            {
                username: 'Park',
                email: '4@naver.com',
                phone: '010-4444-4444',
                words: 'Hello Park'
            },
            {
                username: 'Lee',
                email: '5@naver.com',
                phone: '010-5555-5555',
                words: 'Hello Lee'
            }
        ];

        const blogs = [
            {
                title:"javascript",
                desc:"Javascript language is interpreter language",
                author:{
                    username: 'Kim',
                    email: '1@naver.com',
                    phone: '010-1111-1111',
                    words: 'Hello Kim'
                },
            },
            {
                title:"java",
                desc:"Java language is interpreter language",
                author:{
                    username: 'Nam',
                    email: '2@naver.com',
                    phone: '010-2222-2222',
                    words: 'Hello Nam'
                },
            }
        ]

        for (let i = 0; i < users.length; i++) {
            users[i].docType = 'user';
            await ctx.stub.putState('USER' + i, Buffer.from(JSON.stringify(users[i])));
            console.info('Added <--> ', users[i]);
        }

        for (let i = 0; i < blogs.length; i++) {
            blogs[i].docType = 'blog';
            await ctx.stub.putState('BLOG' + i, Buffer.from(JSON.stringify(blogs[i])));
            console.info('Added <--> ', blogs[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryUser(ctx, userNumber) {
        const userAsBytes = await ctx.stub.getState(userNumber); // get the user from chaincode state
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${userNumber} does not exist`);
        }
        console.log(userAsBytes.toString());
        return userAsBytes.toString();
    }

    async createUser(ctx, userNumber, username, email, phone, words) {
        console.info('============= START : Create User ===========');

        const users = {
            username,
            docType: 'user',
            email,
            phone,
            words,
        };

        await ctx.stub.putState(userNumber, Buffer.from(JSON.stringify(users)));
        console.info('============= END : Create User ===========');
    }

    async queryAllUsers(ctx) {
        const startKey = 'USER0';
        const endKey = 'USER999';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async changeUserName(ctx, userNumber, newUsername) {
        console.info('============= START : changeUserName ===========');

        const userAsBytes = await ctx.stub.getState(userNumber); // get the users from chaincode state
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${userNumber} does not exist`);
        }
        const users = JSON.parse(userAsBytes.toString());
        users.username = newUsername;

        await ctx.stub.putState(userNumber, Buffer.from(JSON.stringify(users)));
        console.info('============= END : changeUserName ===========');
    }

    async queryBlog(ctx, blogNumber) {
        const blogAsBytes = await ctx.stub.getState(blogNumber); // get the blog from chaincode state
        if (!blogAsBytes || blogAsBytes.length === 0) {
            throw new Error(`${blogNumber} does not exist`);
        }
        console.log(blogAsBytes.toString());
        return blogAsBytes.toString();
    }

    async createBlog(ctx, userNumber, blogNumber, title, desc) {
        console.info('============= START : Create Blog ===========');
        const userAsBytes = await ctx.stub.getState(userNumber); // get the user from chaincode state
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${userNumber} does not exist`);
        }
        var users = await JSON.parse(userAsBytes.toString());

        const blogs = {
            title,
            docType: 'blog',
            desc,
            author: users
        };

        await ctx.stub.putState(blogNumber, Buffer.from(JSON.stringify(blogs)));
        console.info('============= END : Create Blog ===========');
    }

    async queryAllBlogs(ctx) {
        const startKey = 'BLOG0';
        const endKey = 'BLOG999';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async changeBlog(ctx, blogNumber, title, newDesc) {
        console.info('============= START : changeBlog ===========');

        const blogAsBytes = await ctx.stub.getState(blogNumber); // get the blog from chaincode state
        if (!blogAsBytes || blogAsBytes.length === 0) {
            throw new Error(`${blogNumber} does not exist`);
        }
        const blogs = JSON.parse(blogAsBytes.toString());
        blogs.title = title;
        blogs.desc = newDesc;

        await ctx.stub.putState(blogNumber, Buffer.from(JSON.stringify(blogs)));
        console.info('============= END : changeBlog ===========');
    }
}

module.exports = FabUser;
